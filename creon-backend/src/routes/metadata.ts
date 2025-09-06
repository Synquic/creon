import { Router } from 'express';
import { fetchMetadata } from '../controllers/metadataController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/fetch', authenticate, fetchMetadata);

export default router;