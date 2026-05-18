'use client';

import { User, Settings, Package, Heart, LogOut, MapPin, Store, Loader2, ChevronRight, ShoppingBag, CheckCircle, Clock, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
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
    : 'bg-gray-100 text-gray-600';

  const roleLabel = user.role === 'FARMER' ? 'Farmer' : user.role === 'SHOP' ? 'Shop' : 'Customer';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-20 md:pt-8">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center text-primary shrink-0">
          <User size={40} />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto md:mx-0 ${roleBadgeColor}`}>
              {roleLabel}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">{user.email}</p>
          {user.location && (
            <p className="text-gray-400 text-sm flex items-center gap-1 justify-center md:justify-start">
              <MapPin size={12} /> {user.location}
            </p>
          )}
          {user.store_name && (
            <p className="text-gray-400 text-sm flex items-center gap-1 justify-center md:justify-start mt-1">
              <Store size={12} /> {user.store_name}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
        >
          My Orders {orders.length > 0 && <span className="ml-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{orders.length}</span>}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 text-left w-full"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">My Orders</h3>
              <p className="text-sm text-gray-500">{orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'No orders yet'}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0">
              <Heart size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Favorites</h3>
              <p className="text-sm text-gray-500">Your saved products</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 shrink-0">
              <Settings size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Account preferences</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>

          <button
            onClick={logout}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 w-full text-left"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shrink-0">
              <LogOut size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-500">Sign Out</h3>
              <p className="text-sm text-gray-500">Log out of your account</p>
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
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4 font-medium">No orders yet</p>
              <Link href="/explore" className="text-primary font-bold hover:underline text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.order_items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={item.products?.image_url || '/images/berries.png'}
                            alt={item.products?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.products?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">₹{item.subtotal}</p>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">+{order.order_items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    <p className="font-bold text-gray-900">₹{order.total_amount}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
