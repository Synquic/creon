import { Router } from 'express';
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  reorderCollections,
  addProductToCollection,
  removeProductFromCollection
} from '../controllers/collectionController';
import { authenticate } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiting';
import {
  paginationValidation,
  handleValidationErrors
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate);

const collectionValidation = [
  body('title')
    .notEmpty()
    .withMessage('Collection title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
  
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  
  body('products.*')
    .optional()
    .isMongoId()
    .withMessage('Each product must be a valid ID')
];

router.post('/',
  createLimiter,
  collectionValidation,
  handleValidationErrors,
  createCollection
);

router.get('/',
  paginationValidation,
  handleValidationErrors,
  getCollections
);

router.get('/:id', getCollectionById);

router.put('/:id',
  collectionValidation,
  handleValidationErrors,
  updateCollection
);

router.delete('/:id', deleteCollection);

router.put('/reorder', reorderCollections);

router.put('/:id/products',
  body('productId').isMongoId().withMessage('Product ID must be valid'),
  handleValidationErrors,
  addProductToCollection
);

router.delete('/:id/products/:productId', removeProductFromCollection);

export default router;