import prisma from '../../config/database';
import { CreateSaleDto } from '../../types';
import { NotFoundError, ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';
import { startOfDay, endOfDay } from 'date-fns';

export class SalesService {
  async createSale(organizationId: string, saleData: CreateSaleDto) {
    // Validate user exists and belongs to organization
    const user = await prisma.user.findFirst({
      where: {
        id: saleData.userId,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate location exists and belongs to organization
    const location = await prisma.location.findFirst({
      where: {
        id: saleData.locationId,
        organizationId,
      },
    });

    if (!location) {
      throw new NotFoundError('Location not found');
    }

    // Check if transaction number already exists
    const existingSale = await prisma.sale.findUnique({
      where: { transactionNumber: saleData.transactionNumber },
    });

    if (existingSale) {
      throw new ValidationError('Transaction number already exists');
    }

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        organizationId,
        locationId: saleData.locationId,
        userId: saleData.userId,
        transactionNumber: saleData.transactionNumber,
        saleDate: saleData.saleDate,
        saleTime: saleData.saleTime,
        totalAmount: saleData.totalAmount,
        fcpAmount: saleData.fcpAmount,
        hoursWorked: saleData.hoursWorked,
        customerName: saleData.customerName,
        notes: saleData.notes,
        items: {
          create: saleData.items,
        },
      },
      include: {
        items: {
          include: {
            productCategory: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    logger.info('Sale created', {
      saleId: sale.id,
      userId: sale.userId,
      amount: sale.totalAmount,
    });

    return sale;
  }

  async getSaleById(id: string, organizationId: string) {
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        items: {
          include: {
            productCategory: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    return sale;
  }

  async getSales(
    organizationId: string,
    filters: {
      userId?: string;
      locationId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters.startDate || filters.endDate) {
      where.saleDate = {};
      if (filters.startDate) {
        where.saleDate.gte = startOfDay(filters.startDate);
      }
      if (filters.endDate) {
        where.saleDate.lte = endOfDay(filters.endDate);
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          saleDate: 'desc',
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDailySummary(organizationId: string, date: Date) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const sales = await prisma.sale.findMany({
      where: {
        organizationId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate summary statistics
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalFcp = sales.reduce((sum, sale) => sum + Number(sale.fcpAmount), 0);
    const fcpPercentage = totalSales > 0 ? (totalFcp / totalSales) * 100 : 0;

    // Group by user
    const byUser = sales.reduce((acc: any, sale) => {
      const userId = sale.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: sale.user,
          totalSales: 0,
          totalFcp: 0,
          transactionCount: 0,
        };
      }
      acc[userId].totalSales += Number(sale.totalAmount);
      acc[userId].totalFcp += Number(sale.fcpAmount);
      acc[userId].transactionCount += 1;
      return acc;
    }, {});

    // Group by location
    const byLocation = sales.reduce((acc: any, sale) => {
      const locationId = sale.locationId;
      if (!acc[locationId]) {
        acc[locationId] = {
          location: sale.location,
          totalSales: 0,
          totalFcp: 0,
          transactionCount: 0,
        };
      }
      acc[locationId].totalSales += Number(sale.totalAmount);
      acc[locationId].totalFcp += Number(sale.fcpAmount);
      acc[locationId].transactionCount += 1;
      return acc;
    }, {});

    return {
      date,
      summary: {
        totalSales,
        totalFcp,
        fcpPercentage,
        transactionCount: sales.length,
      },
      byUser: Object.values(byUser),
      byLocation: Object.values(byLocation),
    };
  }

  async updateSale(
    id: string,
    organizationId: string,
    updateData: Partial<CreateSaleDto>
  ) {
    const existingSale = await this.getSaleById(id, organizationId);

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...(updateData.totalAmount && { totalAmount: updateData.totalAmount }),
        ...(updateData.fcpAmount && { fcpAmount: updateData.fcpAmount }),
        ...(updateData.hoursWorked && { hoursWorked: updateData.hoursWorked }),
        ...(updateData.customerName && { customerName: updateData.customerName }),
        ...(updateData.notes && { notes: updateData.notes }),
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Sale updated', {
      saleId: sale.id,
    });

    return sale;
  }

  async deleteSale(id: string, organizationId: string) {
    const existingSale = await this.getSaleById(id, organizationId);

    await prisma.sale.delete({
      where: { id },
    });

    logger.info('Sale deleted', {
      saleId: id,
    });

    return { message: 'Sale deleted successfully' };
  }
}

export default new SalesService();
