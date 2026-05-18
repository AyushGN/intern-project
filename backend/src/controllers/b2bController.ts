import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 1. Query farmers within a specific radius of a local shop
export const getNearbyFarmers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get current shop coordinates or accept from query params
    let lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
    let lng = req.query.lng ? parseFloat(req.query.lng as string) : null;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50; // Default 50km

    // If no coordinates provided in query, fetch shop's registered coordinates
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('latitude, longitude')
        .eq('id', userId)
        .single();

      if (userError || !user || user.latitude === null || user.longitude === null) {
        // Fallback default coordinates (e.g. Mumbai center) if shop hasn't set coordinates
        lat = 19.0760;
        lng = 72.8777;
      } else {
        lat = parseFloat(user.latitude);
        lng = parseFloat(user.longitude);
      }
    }

    // Fetch all farmers who have coordinates
    const { data: farmers, error } = await supabase
      .from('users')
      .select('id, name, email, store_name, location, latitude, longitude, avatar_url')
      .eq('role', 'FARMER')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    // Filter by radius using Haversine formula
    const nearbyFarmers = farmers
      .map((farmer: any) => {
        const distance = calculateDistance(lat!, lng!, parseFloat(farmer.latitude), parseFloat(farmer.longitude));
        return {
          ...farmer,
          distance: parseFloat(distance.toFixed(2)), // 2 decimal points in km
        };
      })
      .filter((farmer: any) => farmer.distance <= radius)
      .sort((a: any, b: any) => a.distance - b.distance);

    res.status(200).json({
      shopCoordinates: { latitude: lat, longitude: lng },
      radius,
      farmers: nearbyFarmers,
    });
  } catch (error: any) {
    console.error('Get Nearby Farmers Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 2. Send Bulk inquiry from Shop to Farmer
export const createB2BInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.user?.id;
    if (!shopId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { farmer_id, product_id, quantity, unit = 'kg', message } = req.body;

    if (!farmer_id || !quantity) {
      res.status(400).json({ error: 'Farmer ID and Quantity are required' });
      return;
    }

    const { data: inquiry, error } = await supabase
      .from('b2b_inquiries')
      .insert([
        {
          shop_id: shopId,
          farmer_id,
          product_id: product_id || null,
          quantity: parseInt(quantity),
          unit,
          message,
          status: 'pending',
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
  } catch (error: any) {
    console.error('Create B2B Inquiry Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 3. Get all B2B inquiries made by the logged-in Shop
export const getShopInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.user?.id;
    if (!shopId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: inquiries, error } = await supabase
      .from('b2b_inquiries')
      .select(`
        *,
        farmers:farmer_id(id, name, store_name, location, email),
        products:product_id(id, name, price, unit)
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ inquiries });
  } catch (error: any) {
    console.error('Get Shop Inquiries Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 4. Get all B2B inquiries received by the logged-in Farmer
export const getFarmerInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = req.user?.id;
    if (!farmerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: inquiries, error } = await supabase
      .from('b2b_inquiries')
      .select(`
        *,
        shops:shop_id(id, name, store_name, location, email),
        products:product_id(id, name, price, unit)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ inquiries });
  } catch (error: any) {
    console.error('Get Farmer Inquiries Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 5. Update Status of B2B Inquiry (Farmer accepts/rejects)
export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!farmerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status update' });
      return;
    }

    // Verify farmer owns the inquiry
    const { data: checkInquiry, error: checkError } = await supabase
      .from('b2b_inquiries')
      .select('farmer_id')
      .eq('id', id)
      .single();

    if (checkError || !checkInquiry) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    if (checkInquiry.farmer_id !== farmerId) {
      res.status(403).json({ error: 'Forbidden: You do not own this inquiry' });
      return;
    }

    const { data: updatedInquiry, error } = await supabase
      .from('b2b_inquiries')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.status(200).json({ message: `Inquiry ${status} successfully`, inquiry: updatedInquiry });
  } catch (error: any) {
    console.error('Update Inquiry Status Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
