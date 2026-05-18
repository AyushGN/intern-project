import express from 'express';
import {
  getNearbyFarmers,
  createB2BInquiry,
  getShopInquiries,
  getFarmerInquiries,
  updateInquiryStatus
} from '../controllers/b2bController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Apply auth middleware to all B2B endpoints
router.use(authenticateToken);

// Shop specific routes
router.get('/farmers', authorizeRoles('SHOP'), getNearbyFarmers);
router.post('/inquiries', authorizeRoles('SHOP'), createB2BInquiry);
router.get('/inquiries/shop', authorizeRoles('SHOP'), getShopInquiries);

// Farmer specific routes
router.get('/inquiries/farmer', authorizeRoles('FARMER'), getFarmerInquiries);
router.patch('/inquiries/:id', authorizeRoles('FARMER'), updateInquiryStatus);

export default router;
