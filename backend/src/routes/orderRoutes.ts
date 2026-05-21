import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getFarmerOrders,
  updateOrderStatus,
  payOrder,
} from '../controllers/orderController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Consumer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/pay', payOrder);

// Farmer/Admin routes
router.get('/farmer/orders', authorizeRoles('FARMER'), getFarmerOrders);
router.put('/:id/status', authorizeRoles('FARMER'), updateOrderStatus);

export default router;
