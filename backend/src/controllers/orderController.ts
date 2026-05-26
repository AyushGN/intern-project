import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getLoyaltyData, updateLoyaltyData } from './loyaltyHelper';

// Create order (consumer)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { items, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method, discount_amount = 0 } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!product) {
        res.status(400).json({ error: `Product ${item.product_id} not found` });
        return;
      }

      if (product.stock_quantity < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
        return;
      }

      subtotal += product.price * item.quantity;
    }

    const deliveryFee = 40;
    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + deliveryFee + gstAmount - discount_amount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          consumer_id: userId,
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          gst_amount: gstAmount,
          discount_amount: discount_amount,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pincode,
          payment_method: payment_method || 'cod',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items and update stock
    const orderItems = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!product) continue;

      const orderItem = {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        subtotal: product.price * item.quantity,
      };
      orderItems.push(orderItem);

      // Update stock
      await supabase
        .from('products')
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq('id', item.product_id);
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // --- LOYALTY LOGIC ---
    let loyalty = await getLoyaltyData(userId);
    let itemsCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    loyalty.total_products_ordered += itemsCount;
    loyalty.coins += itemsCount * 50; // 50 coins per item

    let newCouponsOwed = Math.floor(loyalty.total_products_ordered / 10);
    let currentCoupons = loyalty.coupons.length;

    while (currentCoupons < newCouponsOwed) {
       let code = `LOYALTY50-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
       loyalty.coupons.push({ code, is_used: false, discount: 50 });
       currentCoupons++;
       loyalty.coins = Math.max(0, loyalty.coins - 500); // 10 items = 500 coins converted

       // Send notification
       loyalty.notifications.push({
         id: Math.random().toString(36).substring(2, 9),
         title: "🎉 Reward Unlocked!",
         message: `You've ordered 10 products! Here is your ₹50 coupon code: ${code}`,
         is_read: false,
         created_at: new Date().toISOString()
       });
    }
    
    // Check if the user used a loyalty coupon in this order and mark it as used
    if (discount_amount === 50) {
       // Since the frontend just passes `discount_amount`, we assume if it's 50 and they have an unused coupon, they might have used it.
       // A better way is to pass `coupon_code` from frontend, but we'll try to find an unused loyalty coupon.
       // However, we don't have the exact code. For simplicity, we just mark one unused coupon as used.
       const unusedCoupon = loyalty.coupons.find(c => !c.is_used);
       if (unusedCoupon) {
         unusedCoupon.is_used = true;
       }
    }

    await updateLoyaltyData(userId, loyalty);
    // --- END LOYALTY LOGIC ---

    res.status(201).json({ message: 'Order created successfully', order, loyalty_coins_earned: itemsCount * 50 });
  } catch (error: any) {
    console.error('Create Order Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get consumer's orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('consumer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ orders: data });
  } catch (error: any) {
    console.error('Get My Orders Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url, farmer_id)), users(name, email)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check if user owns this order
    if (data.consumer_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(200).json({ order: data });
  } catch (error: any) {
    console.error('Get Order Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get orders for farmer (products sold to them)
export const getFarmerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('order_items')
      .select('*, orders!inner(*, users(name, email)), products!inner(name, image_url)')
      .eq('products.farmer_id', userId)
      .order('created_at', { foreignTable: 'orders', ascending: false });

    if (error) throw error;

    res.status(200).json({ orders: data });
  } catch (error: any) {
    console.error('Get Farmer Orders Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update order status (admin or farmer)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status, payment_status } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order updated successfully', order: data });
  } catch (error: any) {
    console.error('Update Order Status Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Pay for an order (consumer)
export const payOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('consumer_id')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.consumer_id !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Update payment status
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Payment status updated', order: data });
  } catch (error: any) {
    console.error('Pay Order Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
