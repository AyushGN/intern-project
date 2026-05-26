'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Truck, Home, Package, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  shipping_address: string;
  order_items: Array<{
    quantity: number;
    subtotal: number;
    products: { name: string; image_url?: string };
  }>;
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to fetch order');
          const data = await res.json();
          setOrder(data.order || data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, isAuthenticated, isLoading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex-1 flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full text-center py-20">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
        <p className="text-muted mb-8">{error || "We couldn't find tracking information for this order."}</p>
        <Link href="/profile" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  
  const timelineSteps = [
    { key: 'pending', label: 'Order Placed', desc: 'We have received your order', icon: Clock },
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Farmer has confirmed the stock', icon: CheckCircle },
    { key: 'shipped', label: 'Out for Delivery', desc: 'Your order is on the way', icon: Truck },
    { key: 'delivered', label: 'Delivered', desc: 'Order has been delivered', icon: Home },
  ];

  // Calculate current step index
  const statusLevels = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentIndex = isCancelled ? -1 : statusLevels.indexOf(order.status);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full pb-24 md:pb-8">
      <Link href="/profile" className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back to Profile
      </Link>

      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Track Order</h1>
            <p className="text-sm text-muted">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1">Placed On</p>
            <p className="font-semibold text-foreground">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {isCancelled ? (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8">
            <Package size={24} />
            <div>
              <p className="font-bold">Order Cancelled</p>
              <p className="text-sm opacity-90">This order has been cancelled.</p>
            </div>
          </div>
        ) : (
          <div className="relative pl-4 md:pl-8 mb-10">
            {/* Vertical Line */}
            <div className="absolute left-[35px] md:left-[51px] top-6 bottom-6 w-0.5 bg-border z-0"></div>
            
            {/* Active Line Overlap */}
            <div 
              className="absolute left-[35px] md:left-[51px] top-6 w-0.5 bg-primary z-0 transition-all duration-500"
              style={{ height: currentIndex > 0 ? `${(currentIndex / 3) * 100}%` : '0%' }}
            ></div>

            <div className="space-y-8 relative z-10">
              {timelineSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentIndex >= index;
                const isCurrent = currentIndex === index;
                
                return (
                  <div key={step.key} className={`flex items-start gap-4 md:gap-6 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted ? 'bg-primary text-white shadow-md' : 'bg-background border-2 border-border text-muted'
                    }`}>
                      <StepIcon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                    </div>
                    <div className="pt-2">
                      <p className={`font-bold ${isCompleted ? 'text-foreground' : 'text-muted'}`}>{step.label}</p>
                      <p className="text-sm text-muted mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="bg-background rounded-xl p-5 border border-border">
          <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {(order.order_items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-muted">{item.quantity}x</span>
                  <span className="font-medium text-foreground">{item.products?.name || 'Product'}</span>
                </div>
                <span className="font-medium">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary text-lg">₹{order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
