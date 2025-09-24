import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductAnalytics,
  retestProducts,
  retestAllProducts
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiting';
import {
  productValidation,
  paginationValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post('/',
  createLimiter,
  productValidation,
  handleValidationErrors,
  createProduct
);

router.get('/',
  paginationValidation,
  handleValidationErrors,
  getProducts
);

router.get('/:id', getProductById);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

router.get('/:id/analytics', getProductAnalytics);

router.post('/retest', retestProducts);

router.post('/retest-all', retestAllProducts);

export default router;