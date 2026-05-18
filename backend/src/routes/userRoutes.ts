import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Both routes require the user to be logged in
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
