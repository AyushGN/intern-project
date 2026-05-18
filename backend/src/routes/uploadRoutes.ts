import { Router } from 'express';
import { uploadImage, upload } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', upload.single('image'), uploadImage);

export default router;
