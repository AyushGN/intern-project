import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getLoyaltyData, updateLoyaltyData } from '../controllers/loyaltyHelper';

const router = express.Router();

router.get('/notifications', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const data = await getLoyaltyData(userId);
    res.json({ notifications: data.notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.patch('/notifications/:id/read', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const data = await getLoyaltyData(userId);
    const notif = data.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      await updateLoyaltyData(userId, data);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/loyalty', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const data = await getLoyaltyData(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/coupons/validate', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;
    
    if (!code) return res.status(400).json({ error: 'Code required' });
    
    const data = await getLoyaltyData(userId);
    const coupon = data.coupons.find(c => c.code === code);
    
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon' });
    }
    if (coupon.is_used) {
      return res.status(400).json({ error: 'Coupon already used' });
    }
    
    res.json({ discountAmount: coupon.discount });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
