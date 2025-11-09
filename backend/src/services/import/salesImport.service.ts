import { PrismaClient } from '@prisma/client';
import { CSVValidator, parseCSV, cleanData } from '../../utils/csvValidator';
import { parse, format } from 'date-fns';

const prisma = new PrismaClient();

interface SalesCSVRow {
  transaction_number: string;
  sale_date: string;
  sale_time: string;
  salesperson_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email?: string;
  product_name: string;
  product_category: string;
  quantity: string;
  unit_price: string;
  cost_price?: string;
  fcp_amount?: string;
  hours_worked?: string;
  notes?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  salesCreated: number;
  customersCreated: number;
  errors: any[];
  warnings: any[];
  summary: {
    totalSalesAmount: number;
    totalFCP: number;
    salesBySalesperson: any[];
  };
}

interface PreviewResult {
  valid: boolean;
  totalRows: number;
  estimatedSales: number;
  estimatedCustomers: number;
  errors: any[];
  warnings: any[];
  preview: any[];
}

export class SalesImportService {
  // Validate CSV data
  async validateSalesCSV(csvText: string): Promise<PreviewResult> {
    const rows = await parseCSV(csvText);
    const validator = new CSVValidator();
    const cleanedRows: SalesCSVRow[] = [];
    const transactionNumbers = new Set<string>();
    const customerPhones = new Set<string>();

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = cleanData(rows[i]) as SalesCSVRow;
      const rowNum = i + 2; // +2 for header and 0-index

      // Required fields
      validator.required(row.transaction_number, rowNum, 'transaction_number');
      validator.date(row.sale_date, rowNum, 'sale_date');
      validator.time(row.sale_time, rowNum, 'sale_time');
      validator.email(row.salesperson_email, rowNum, 'salesperson_email', true);
      validator.required(row.customer_first_name, rowNum, 'customer_first_name');
      validator.required(row.customer_last_name, rowNum, 'customer_last_name');
      validator.phone(row.customer_phone, rowNum, 'customer_phone');
      validator.required(row.product_name, rowNum, 'product_name');
      validator.required(row.product_category, rowNum, 'product_category');
      validator.positiveInteger(row.quantity, rowNum, 'quantity');
      validator.positiveNumber(row.unit_price, rowNum, 'unit_price');

      // Optional fields
      if (row.customer_email) {
        validator.email(row.customer_email, rowNum, 'customer_email', false);
      }
      validator.decimal(row.cost_price, rowNum, 'cost_price', false);
      validator.decimal(row.fcp_amount, rowNum, 'fcp_amount', false);
      validator.decimal(row.hours_worked, rowNum, 'hours_worked', false);

      // Business logic validations
      validator.margin(row.cost_price, row.unit_price, rowNum);

      transactionNumbers.add(row.transaction_number);
      customerPhones.add(validator.cleanPhone(row.customer_phone));
      cleanedRows.push(row);
    }

    // Check if salesperson emails exist
    const uniqueEmails = [...new Set(cleanedRows.map(r => r.salesperson_email))];
    for (const email of uniqueEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        validator.getErrors().push({
          row: 0,
          column: 'salesperson_email',
          value: email,
          message: `Salesperson not found: '${email}'. Please create this user first.`,
        });
      }
    }

    return {
      valid: validator.isValid(),
      totalRows: rows.length,
      estimatedSales: transactionNumbers.size,
      estimatedCustomers: customerPhones.size,
      errors: validator.getErrors(),
      warnings: validator.getWarnings(),
      preview: cleanedRows.slice(0, 10), // First 10 rows preview
    };
  }

  // Import sales from CSV
  async importSales(csvText: string, organizationId: string, locationId: string): Promise<ImportResult> {
    const validation = await this.validateSalesCSV(csvText);

    if (!validation.valid) {
      return {
        success: false,
        totalRows: validation.totalRows,
        processedRows: 0,
        salesCreated: 0,
        customersCreated: 0,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: {
          totalSalesAmount: 0,
          totalFCP: 0,
          salesBySalesperson: [],
        },
      };
    }

    const rows = await parseCSV(csvText);
    const cleanedRows: SalesCSVRow[] = rows.map(cleanData);

    // Group rows by transaction_number
    const transactionGroups = new Map<string, SalesCSVRow[]>();
    for (const row of cleanedRows) {
      const txnNum = row.transaction_number;
      if (!transactionGroups.has(txnNum)) {
        transactionGroups.set(txnNum, []);
      }
      transactionGroups.get(txnNum)!.push(row);
    }

    const validator = new CSVValidator();
    let salesCreated = 0;
    let customersCreated = 0;
    let totalSalesAmount = 0;
    let totalFCP = 0;
    const salesBySalesperson = new Map<string, number>();

    // Process each transaction
    for (const [transactionNumber, items] of transactionGroups) {
      try {
        const firstItem = items[0];

        // Find or create customer
        const cleanPhone = validator.cleanPhone(firstItem.customer_phone);
        let customer = await prisma.customer.findFirst({
          where: {
            organizationId,
            phone: cleanPhone,
          },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              organizationId,
              firstName: firstItem.customer_first_name,
              lastName: firstItem.customer_last_name,
              phone: cleanPhone,
              email: firstItem.customer_email || null,
            },
          });
          customersCreated++;
        }

        // Find salesperson
        const salesperson = await prisma.user.findUnique({
          where: { email: firstItem.salesperson_email },
        });

        if (!salesperson) {
          throw new Error(`Salesperson not found: ${firstItem.salesperson_email}`);
        }

        // Calculate totals for this sale
        let saleTotal = 0;
        let fcpTotal = 0;
        for (const item of items) {
          const quantity = parseInt(item.quantity);
          const unitPrice = parseFloat(item.unit_price);
          const fcp = item.fcp_amount ? parseFloat(item.fcp_amount) : 0;
          saleTotal += quantity * unitPrice;
          fcpTotal += fcp;
        }

        const grandTotal = saleTotal + fcpTotal;

        // Parse date and time
        const saleDate = parse(firstItem.sale_date, 'yyyy-MM-dd', new Date());
        const saleTime = parse(firstItem.sale_time, 'HH:mm', new Date());

        // Create sale
        const sale = await prisma.sale.create({
          data: {
            organizationId,
            locationId,
            userId: salesperson.id,
            customerId: customer.id,
            transactionNumber,
            saleDate,
            saleTime,
            totalAmount: grandTotal,
            fcpAmount: fcpTotal,
            hoursWorked: firstItem.hours_worked ? parseFloat(firstItem.hours_worked) : 0,
            customerName: `${customer.firstName} ${customer.lastName}`,
            notes: firstItem.notes || null,
          },
        });

        // Create sale items
        for (const item of items) {
          const quantity = parseInt(item.quantity);
          const unitPrice = parseFloat(item.unit_price);
          const totalPrice = quantity * unitPrice;
          const costPrice = item.cost_price ? parseFloat(item.cost_price) : null;

          let marginAmount = null;
          let marginPercentage = null;
          if (costPrice) {
            marginAmount = totalPrice - (costPrice * quantity);
            marginPercentage = (marginAmount / totalPrice) * 100;
          }

          // Find or create category
          let category = await prisma.productCategory.findFirst({
            where: {
              organizationId,
              name: item.product_category,
            },
          });

          if (!category) {
            category = await prisma.productCategory.create({
              data: {
                organizationId,
                name: item.product_category,
                code: item.product_category.toUpperCase().replace(/\s+/g, '_'),
              },
            });
          }

          await prisma.saleItem.create({
            data: {
              saleId: sale.id,
              productCategoryId: category.id,
              productName: item.product_name,
              quantity,
              unitPrice,
              totalPrice,
              costPrice,
              marginAmount,
              marginPercentage,
            },
          });
        }

        // Update customer lifetime value
        await this.updateCustomerLifetimeValue(customer.id);

        salesCreated++;
        totalSalesAmount += grandTotal;
        totalFCP += fcpTotal;

        const currentSales = salesBySalesperson.get(salesperson.email) || 0;
        salesBySalesperson.set(salesperson.email, currentSales + grandTotal);

      } catch (error: any) {
        validation.errors.push({
          row: 0,
          column: 'transaction_number',
          value: transactionNumber,
          message: `Failed to import transaction ${transactionNumber}: ${error.message}`,
        });
      }
    }

    // Format salesperson summary
    const salesSummary = Array.from(salesBySalesperson.entries()).map(([email, amount]) => ({
      salesperson: email,
      totalSales: amount,
    }));

    return {
      success: true,
      totalRows: cleanedRows.length,
      processedRows: cleanedRows.length,
      salesCreated,
      customersCreated,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: {
        totalSalesAmount,
        totalFCP,
        salesBySalesperson: salesSummary,
      },
    };
  }

  // Update customer lifetime value
  private async updateCustomerLifetimeValue(customerId: string): Promise<void> {
    const sales = await prisma.sale.findMany({
      where: { customerId },
      select: { totalAmount: true, saleDate: true },
    });

    const totalLifetimeValue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalPurchases = sales.length;
    const lastPurchase = sales.length > 0
      ? sales.sort((a, b) => b.saleDate.getTime() - a.saleDate.getTime())[0].saleDate
      : null;

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalLifetimeValue,
        totalPurchases,
        lastPurchaseDate: lastPurchase,
      },
    });
  }
}

export const salesImportService = new SalesImportService();
