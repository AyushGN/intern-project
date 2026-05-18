import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all active products (public)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('products')
      .select('*, users(name, store_name, location)')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    res.status(200).json({
      products: data,
      total: count,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    console.error('Get Products Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*, users(name, store_name, location)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product: data });
  } catch (error: any) {
    console.error('Get Product Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create product (farmer only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, price, category, image_url, stock_quantity, unit } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ error: 'Name, price, and category are required' });
      return;
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([
        {
          farmer_id: userId,
          name,
          description,
          price,
          category,
          image_url,
          stock_quantity: stock_quantity || 0,
          unit: unit || 'kg',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error: any) {
    console.error('Create Product Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update product (farmer only, own products)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, price, category, image_url, stock_quantity, unit, is_active } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (image_url !== undefined) updates.image_url = image_url;
    if (stock_quantity !== undefined) updates.stock_quantity = stock_quantity;
    if (unit !== undefined) updates.unit = unit;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('farmer_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Product not found or you do not have permission' });
        return;
      }
      throw error;
    }

    res.status(200).json({ message: 'Product updated successfully', product: data });
  } catch (error: any) {
    console.error('Update Product Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete product (farmer only, own products)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('farmer_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Product not found or you do not have permission' });
        return;
      }
      throw error;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete Product Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get farmer's own products
export const getFarmerProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ products: data });
  } catch (error: any) {
    console.error('Get Farmer Products Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
