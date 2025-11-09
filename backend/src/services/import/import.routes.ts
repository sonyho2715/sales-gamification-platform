import { Router } from 'express';
import { importController } from './import.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sales CSV import routes
router.post(
  '/sales/preview',
  importController.uploadMiddleware,
  importController.previewSalesCSV.bind(importController)
);

router.post(
  '/sales/import',
  importController.uploadMiddleware,
  importController.importSalesCSV.bind(importController)
);

// Download sample templates
router.get(
  '/templates/:type',
  importController.downloadSampleCSV.bind(importController)
);

export default router;
