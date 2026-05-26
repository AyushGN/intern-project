'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Package, Plus, Edit2, Trash2, Loader2, TrendingUp, ShoppingCart, DollarSign, Clock, CheckCircle, Truck, MapPin, MessageSquare, Bell } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export default function FarmerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'inquiries'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'FARMER') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === 'FARMER') {
      fetchProducts();
      fetchOrders();
      fetchInquiries();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/farmer/my-products`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/farmer/orders`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch farmer orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/b2b/inquiries/farmer`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setInquiries(data.inquiries || []);
    } catch (error) {
      console.error('Failed to fetch farmer inquiries:', error);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'confirmed' | 'shipped' | 'delivered') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Optimistically update status locally in nested data structure
        setOrders(prev => prev.map(item => {
          if (item.orders?.id === orderId) {
            return {
              ...item,
              orders: {
                ...item.orders,
                status
              }
            };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/b2b/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Optimistically update status locally
        setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status } : inq));
      }
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (isLoading || loadingProducts) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full pt-20 md:pt-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'FARMER') return null;

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const pendingOrdersCount = orders.filter(o => o.orders?.status === 'pending').length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full pt-20 md:pt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Farmer Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => {
                const el = document.getElementById('farmer-notifications');
                if (el) el.classList.toggle('hidden');
              }}
              className="p-3 rounded-full bg-card border border-border hover:bg-background transition-colors relative shadow-sm"
            >
              <Bell size={20} className="text-muted" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-card"></span>
              )}
            </button>
            <div id="farmer-notifications" className="hidden absolute right-0 top-full mt-2 w-72 bg-card rounded-2xl shadow-xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-bold text-foreground mb-3 text-sm border-b border-border pb-2">Notifications</h3>
              {pendingOrdersCount > 0 ? (
                <div className="text-left space-y-3">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                    <p className="text-sm font-semibold text-blue-800">New Orders Received!</p>
                    <p className="text-xs text-blue-600 mt-1">You have {pendingOrdersCount} order(s) waiting to be accepted.</p>
                    <button onClick={() => {
                      setActiveTab('orders');
                      document.getElementById('farmer-notifications')?.classList.add('hidden');
                    }} className="mt-2 text-xs font-bold text-blue-700 hover:underline">View Orders</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell size={28} className="mx-auto text-gray-300 mb-3 opacity-50" />
                  <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/farmer/add-product"
            className="bg-primary text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Total Products</p>
              <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">Total Stock</p>
              <p className="text-3xl font-bold text-blue-600">{totalStock} kg</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'products'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          My Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'orders'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'inquiries'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Bulk Inquiries {inquiries.length > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              {inquiries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'analytics'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted mb-4">You haven't added any products yet</p>
              <Link
                href="/farmer/add-product"
                className="text-primary font-semibold hover:underline"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Stock</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-border hover:bg-background">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-border rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-semibold text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted capitalize">{product.category}</td>
                      <td className="py-4 px-6 font-semibold text-primary">₹{product.price}</td>
                      <td className="py-4 px-6 text-sm text-muted">{product.stock_quantity} kg</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-border text-muted'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Link
                            href={`/farmer/edit-product/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted">No orders received yet</p>
            </div>
          ) : (
            orders.map((item: any, idx: number) => (
              <div key={idx} className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.products?.name}</p>
                    <p className="text-sm text-muted">Qty: {item.quantity} · ₹{item.subtotal}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.orders?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    item.orders?.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                    item.orders?.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  } capitalize`}>
                    {item.orders?.status}
                  </span>
                </div>
                <div className="bg-background rounded-xl p-3 text-sm mb-3">
                  <p className="font-medium text-foreground">{item.orders?.users?.name || item.orders?.shipping_name}</p>
                  <p className="text-muted text-xs mt-0.5">{item.orders?.shipping_address}, {item.orders?.shipping_city}</p>
                  <p className="text-gray-400 text-xs">{item.orders?.users?.email}</p>
                </div>
                
                {item.orders?.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(item.orders.id, 'confirmed')}
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors"
                  >
                    Accept Order
                  </button>
                )}
                {item.orders?.status === 'confirmed' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(item.orders.id, 'shipped')}
                    className="w-full bg-purple-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                {item.orders?.status === 'shipped' && (
                  <button 
                    onClick={() => handleUpdateOrderStatus(item.orders.id, 'delivered')}
                    className="w-full bg-green-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-card rounded-2xl p-12 shadow-sm border border-border text-center">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-muted">Analytics feature coming soon</p>
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiriesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 shadow-sm border border-border text-center">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-muted">No B2B inquiries received yet</p>
            </div>
          ) : (
            inquiries.map((inquiry: any) => (
              <div key={inquiry.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{inquiry.shops?.store_name || inquiry.shops?.name}</h4>
                    <p className="text-xs text-muted">Contact: {inquiry.shops?.email}</p>
                    <p className="text-xs text-gray-400">Location: {inquiry.shops?.location || 'Nearby Shop'}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                    inquiry.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                    inquiry.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    inquiry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {inquiry.status === 'pending' ? 'Pending Response' : `Inquiry ${inquiry.status}`}
                  </span>
                </div>

                <div className="bg-background rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-2">
                    <span className="text-xs font-semibold text-muted">Requested Crop Qty:</span>
                    <span className="text-sm font-bold text-foreground">{inquiry.quantity} {inquiry.unit}</span>
                  </div>
                  {inquiry.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Message from Shop:</p>
                      <p className="text-xs text-muted leading-relaxed italic">{inquiry.message}</p>
                    </div>
                  )}
                </div>

                {inquiry.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateInquiryStatus(inquiry.id, 'accepted')}
                      className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-xs hover:bg-primary/95 transition-all shadow-sm"
                    >
                      Accept Inquiry
                    </button>
                    <button
                      onClick={() => handleUpdateInquiryStatus(inquiry.id, 'rejected')}
                      className="flex-1 bg-card text-red-600 border border-red-200 font-bold py-2.5 rounded-xl text-xs hover:bg-red-50 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {inquiry.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateInquiryStatus(inquiry.id, 'completed')}
                    className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Truck size={14} /> Mark as Fulfilled & Delivered
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
