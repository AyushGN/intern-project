import { supabase } from '../config/supabase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface LoyaltyData {
  total_products_ordered: number;
  coins: number;
  coupons: { code: string; is_used: boolean; discount: number }[];
  notifications: Notification[];
}

export const getLoyaltyData = async (userId: string): Promise<LoyaltyData> => {
  const { data } = await supabase.from('users').select('store_name').eq('id', userId).single();
  let loyalty: LoyaltyData = { total_products_ordered: 0, coins: 0, coupons: [], notifications: [] };
  
  if (data?.store_name) {
    try {
      const parsed = JSON.parse(data.store_name);
      if (parsed.total_products_ordered !== undefined) {
        loyalty = { ...loyalty, ...parsed };
      }
    } catch (e) {
      // Not JSON, ignore
    }
  }
  return loyalty;
};

export const updateLoyaltyData = async (userId: string, data: LoyaltyData) => {
  await supabase.from('users').update({ store_name: JSON.stringify(data) }).eq('id', userId);
};
