import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
} from '../controllers/productController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(authenticateToken);

// Farmer-only routes
router.post('/', authorizeRoles('FARMER'), createProduct);
router.get('/farmer/my-products', authorizeRoles('FARMER'), getFarmerProducts);
router.put('/:id', authorizeRoles('FARMER'), updateProduct);
router.delete('/:id', authorizeRoles('FARMER'), deleteProduct);

export default router;
