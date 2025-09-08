import { Router } from 'express';
import { fetchResponse } from '../controllers/dataParsingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/data-parsing/fetch-response
router.get('/', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
router.post('/fetch-response', authenticate, fetchResponse);

export default router;
