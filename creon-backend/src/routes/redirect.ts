import { Router } from 'express';
import { redirectLink } from '../controllers/linkController';
import { redirectProduct } from '../controllers/productController';
import {
  shortCodeValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

router.get('/s/:shortCode',
  shortCodeValidation,
  handleValidationErrors,
  redirectLink
);

router.get('/p/:shortCode',
  shortCodeValidation,
  handleValidationErrors,
  redirectProduct
);

export default router;