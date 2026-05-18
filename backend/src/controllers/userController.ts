import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get current user's profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, location, store_name, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update current user's profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, location, store_name } = req.body;

    // Define updates object dynamically based on provided fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (store_name !== undefined) updates.store_name = store_name;

    // Supabase trigger will handle updated_at
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, name, role, location, store_name, updated_at')
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
