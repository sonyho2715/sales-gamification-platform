import { Response } from 'express';
import { AuthRequest } from '../../types';
import { salesImportService } from './salesImport.service';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export class ImportController {
  // Middleware for file upload
  uploadMiddleware = upload.single('file');

  // Preview sales CSV (validate without importing)
  async previewSalesCSV(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const csvText = req.file.buffer.toString('utf-8');
      const result = await salesImportService.validateSalesCSV(csvText);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Sales CSV preview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to preview CSV',
        error: error.message,
      });
    }
  }

  // Import sales CSV
  async importSalesCSV(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const { organizationId, locationId } = req.user!;

      // If locationId not provided in user, check request body
      const targetLocationId = locationId || req.body.locationId;

      if (!targetLocationId) {
        return res.status(400).json({
          success: false,
          message: 'Location ID is required',
        });
      }

      const csvText = req.file.buffer.toString('utf-8');
      const result = await salesImportService.importSales(csvText, organizationId, targetLocationId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Import failed due to validation errors',
          data: result,
        });
      }

      res.json({
        success: true,
        message: `Successfully imported ${result.salesCreated} sales and created ${result.customersCreated} customers`,
        data: result,
      });
    } catch (error: any) {
      console.error('Sales CSV import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import CSV',
        error: error.message,
      });
    }
  }

  // Download sample CSV template
  async downloadSampleCSV(req: AuthRequest, res: Response) {
    try {
      const { type } = req.params; // 'sales', 'customers', 'users'

      let filename = '';
      let content = '';

      switch (type) {
        case 'sales':
          filename = 'sales-import-template.csv';
          content = `transaction_number,sale_date,sale_time,salesperson_email,customer_first_name,customer_last_name,customer_phone,customer_email,product_name,product_category,quantity,unit_price,cost_price,fcp_amount,hours_worked,notes
TXN-2025-001,2025-01-15,14:30,john.smith@demo.com,Michael,Johnson,555-0123,michael.j@email.com,Sectional Sofa,Living Room,1,2499.99,1200.00,299.99,8.0,Customer requested white glove delivery
TXN-2025-001,2025-01-15,14:30,john.smith@demo.com,Michael,Johnson,555-0123,michael.j@email.com,Coffee Table,Living Room,1,399.99,180.00,0,8.0,`;
          break;

        case 'customers':
          filename = 'customers-import-template.csv';
          content = `first_name,last_name,phone,email,address,city,state,zip_code,notes
Michael,Johnson,555-0123,michael.j@email.com,123 Main St,Los Angeles,CA,90001,Prefers morning delivery
Emily,Davis,555-0124,emily.d@email.com,456 Oak Ave,San Francisco,CA,94102,Interested in bedroom furniture`;
          break;

        case 'users':
          filename = 'users-import-template.csv';
          content = `email,first_name,last_name,role,location_code,hire_date,password
james.wilson@store.com,James,Wilson,SALESPERSON,MAIN,2024-06-15,Welcome123!
sophia.brown@store.com,Sophia,Brown,SALESPERSON,NORTH,2024-08-01,Welcome123!`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid template type. Use: sales, customers, or users',
          });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);

    } catch (error: any) {
      console.error('Download template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download template',
        error: error.message,
      });
    }
  }
}

export const importController = new ImportController();
