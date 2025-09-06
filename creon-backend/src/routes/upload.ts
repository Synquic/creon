import { Router } from 'express';
import { uploadImage, uploadProfileImage } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiting';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.use(authenticate);
router.use(uploadLimiter);

router.post('/image',
  uploadSingle('image'),
  uploadImage
);

router.post('/profile',
  uploadSingle('profileImage'),
  uploadProfileImage
);

export default router;