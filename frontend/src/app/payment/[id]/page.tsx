'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrder(data.order);
      } else {
        router.push('/explore');
      }
    } catch (err) {
      console.error(err);
      router.push('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method.');
      return;
    }

    setProcessing(true);
    setError('');

    // Simulate payment delay
    setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/pay`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            payment_status: 'paid',
          }),
        });

        if (res.ok) {
          router.push('/order-success');
        } else {
          const data = await res.json();
          throw new Error(data.error || 'Payment confirmation failed');
        }
      } catch (err: any) {
        setError(err.message);
        setProcessing(false);
      }
    }, 2500); // 2.5 second mock delay
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-[90vh] bg-background p-4 md:p-8 flex justify-center items-center">
      <div className="max-w-md w-full bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary p-6 text-white text-center relative">
          <Link href="/checkout" className="absolute left-6 top-6 hover:text-white/80 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold mb-1">Complete Payment</h1>
          <p className="text-primary-foreground/80 text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          
          <div className="mt-6 bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <p className="text-sm font-medium mb-1 opacity-90">Amount to Pay</p>
            <p className="text-4xl font-extrabold">₹{order.total_amount}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 text-center font-medium">
              {error}
            </div>
          )}

          <h2 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wider">Select Payment Method</h2>
          
          <div className="space-y-3 mb-8">
            {/* Payment Options */}
            {[
              { id: 'gpay', name: 'Google Pay (GPay)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              { id: 'paytm', name: 'Paytm', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              { id: 'card', name: 'Credit / Debit Card', color: 'bg-gray-50 text-gray-700 border-gray-200' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  selectedMethod === method.id 
                    ? `border-primary bg-primary/5 shadow-sm` 
                    : `border-border bg-background hover:border-primary/40`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${method.color}`}>
                    {method.id === 'card' ? <CreditCard size={18} /> : method.name[0]}
                  </div>
                  <span className={`font-semibold ${selectedMethod === method.id ? 'text-primary' : 'text-foreground'}`}>
                    {method.name}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id ? 'border-primary' : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-600 mb-6 bg-green-50 py-2 rounded-lg">
            <ShieldCheck size={16} />
            100% Secure Payment
          </div>

          <button
            onClick={handlePay}
            disabled={processing || !selectedMethod}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ₹${order.total_amount}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
