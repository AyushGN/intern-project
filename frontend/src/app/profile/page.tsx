'use client';

import { User, Settings, Package, Heart, LogOut, MapPin, Store, Loader2, ChevronRight, ShoppingBag, CheckCircle, Clock, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductFallbackImage } from '@/utils/fallbackImage';
import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/ProductCard';
import { useTheme } from 'next-themes';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    subtotal: number;
    products: { name: string; image_url?: string };
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { favorites } = useFavorites();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'settings'>('overview');
  const [loyalty, setLoyalty] = useState<{coins: number; total_products_ordered: number}>({ coins: 0, total_products_ordered: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
      fetchLoyalty();
    }
  }, [isAuthenticated, user]);

  const fetchLoyalty = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loyalty`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setLoyalty(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full pt-20 md:pt-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const roleBadgeColor = user.role === 'FARMER'
    ? 'bg-green-100 text-green-700'
    : user.role === 'SHOP'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-border text-muted';

  const roleLabel = user.role === 'FARMER' ? 'Farmer' : user.role === 'SHOP' ? 'Shop' : 'Customer';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-20 md:pt-8">
      {/* Profile Card */}
      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary shrink-0">
          <User size={40} />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">{user.name || 'User'}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto md:mx-0 ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
          <p className="text-muted text-sm mb-1">{user.email}</p>
          {user.location && (
            <p className="text-gray-400 text-sm flex items-center gap-1 justify-center md:justify-start">
              <MapPin size={12} /> {user.location}
            </p>
          )}
          {user.store_name && user.role !== 'CONSUMER' && (
            <p className="text-gray-400 text-sm flex items-center gap-1 justify-center md:justify-start mt-1">
              <Store size={12} /> {user.store_name}
            </p>
          )}
        </div>
        
        {user.role === 'CONSUMER' && (
          <div className="md:border-l border-border md:pl-6 pt-4 md:pt-0 w-full md:w-auto">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <p className="text-sm text-primary font-bold mb-2">Loyalty Rewards</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-foreground">{loyalty.coins}</span>
                  <span className="text-xs text-muted">Coins Earned</span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-foreground">{loyalty.total_products_ordered % 10}<span className="text-sm text-muted">/10</span></span>
                  <span className="text-xs text-muted">Next Coupon</span>
                </div>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(loyalty.total_products_ordered % 10) * 10}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-border p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-card text-foreground shadow-sm' : 'text-muted'}`}
        >
          My Orders {orders.length > 0 && <span className="ml-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{orders.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'favorites' ? 'bg-card text-foreground shadow-sm' : 'text-muted'}`}
        >
          Favorites {favorites.length > 0 && <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{favorites.length}</span>}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">My Orders</h3>
              <p className="text-sm text-muted">{orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'No orders yet'}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0">
              <Heart size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Favorites</h3>
              <p className="text-sm text-muted">{favorites.length} saved products</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex items-center gap-4 w-full text-left"
          >
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-muted shrink-0">
              <Settings size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Settings</h3>
              <p className="text-sm text-muted">Account preferences</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={logout}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex items-center gap-4 w-full text-left"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0">
              <LogOut size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-500">Sign Out</h3>
              <p className="text-sm text-muted">Log out of your account</p>
            </div>
          </button>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 shadow-sm border border-border text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted mb-4 font-medium">No orders yet</p>
              <Link href="/explore" className="text-primary font-bold hover:underline text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {(order.order_items || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-lg overflow-hidden shrink-0 border border-border">
                          <img
                            src={item.products?.image_url || getProductFallbackImage(item.products?.name || '', '')}
                            alt={item.products?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.products?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{item.subtotal}</p>
                      </div>
                    ))}
                    {(order.order_items || []).length > 3 && (
                      <p className="text-xs text-muted text-center">+{order.order_items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <p className="text-sm text-muted capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    <p className="font-bold text-foreground">₹{order.total_amount}</p>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-border/50">
                    <Link 
                      href={`/orders/${order.id}/track`}
                      className="block w-full text-center bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors font-bold py-2 rounded-xl text-sm"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 shadow-sm border border-border text-center">
              <Heart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted mb-4 font-medium">No saved favorites yet</p>
              <Link href="/explore" className="text-primary font-bold hover:underline text-sm">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-foreground">Theme Preference</p>
                <p className="text-sm text-muted">Select your preferred color scheme</p>
              </div>
              <div className="flex bg-background border border-border rounded-xl p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'system' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  System
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted">Receive order updates via email</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border/50">
                <div>
                  <p className="font-semibold text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted">Receive delivery updates via SMS</p>
                </div>
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-primary font-semibold hover:underline text-sm"
            >
              &larr; Back to Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
