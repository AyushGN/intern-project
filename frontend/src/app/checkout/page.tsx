'use client';

import { ChevronLeft, MapPin, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const originalPrice = cartTotal;
  const delivery = originalPrice > 0 ? 40 : 0;
  const gst = originalPrice > 0 ? Math.round(originalPrice * 0.18) : 0;
  const discount = originalPrice > 0 ? 20 : 0;
  const finalTotal = originalPrice > 0 ? originalPrice + delivery + gst - discount : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.state || !shippingDetails.pincode) {
      setError('Please fill in all shipping details');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          shipping_name: shippingDetails.name,
          shipping_phone: shippingDetails.phone,
          shipping_address: shippingDetails.address,
          shipping_city: shippingDetails.city,
          shipping_state: shippingDetails.state,
          shipping_pincode: shippingDetails.pincode,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      router.push('/order-success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 bg-background md:bg-transparent">
      {/* Header */}
      <div className="bg-card px-4 py-4 md:py-8 flex items-center sticky top-0 z-10 md:static md:bg-transparent md:mb-4">
        <Link href="/" className="p-2 -ml-2 text-muted hover:text-primary transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold ml-2">Checkout</h1>
      </div>

      {error && (
        <div className="mx-4 md:mx-0 max-w-4xl md:mx-auto w-full mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl p-3 text-center font-medium">
          {error}
        </div>
      )}

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-32 md:pb-8">
        
        {/* Left Column (Items & Shipping) */}
        <div className="md:col-span-7 space-y-6">
          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border text-center">
              <p className="text-muted mb-4">Your cart is empty.</p>
              <Link href="/explore" className="text-primary font-bold hover:underline">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-card p-4 rounded-2xl shadow-sm border border-border flex gap-4 items-center relative">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                  <div className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-primary font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-primary text-white rounded-full px-3 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center font-bold"
                    >-</button>
                    <span className="font-semibold min-w-[1ch] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center font-bold"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Link href="/explore" className="inline-block text-primary font-semibold text-sm hover:underline mt-4">
            Add more items
          </Link>

          {/* Shipping Details */}
          <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-muted text-sm">Shipping Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={shippingDetails.name}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="+91 12345 67890"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={shippingDetails.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="123456"
                />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted mb-2">Payment Method</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    paymentMethod === 'cod'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-muted border-border'
                  }`}
                >
                  Cash on Delivery
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    paymentMethod === 'online'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-muted border-border'
                  }`}
                >
                  Online Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Invoice) */}
        <div className="md:col-span-5 space-y-6">
          {/* Coupon */}
          <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 text-primary font-semibold">
              <Tag size={20} />
              <span>Apply Coupon</span>
            </div>
            <ChevronLeft size={20} className="text-gray-400 rotate-180" />
          </div>

          {/* Invoice */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-muted text-sm mb-4">Invoice</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Original Price</span>
                <span className="font-medium text-foreground">₹{originalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="font-medium text-red-500">+{delivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">GST</span>
                <span className="font-medium text-red-500">+{gst}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Discount</span>
                <span className="font-medium text-primary">-{discount}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-primary">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-[72px] md:bottom-8 left-0 md:left-64 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border md:border-none md:bg-transparent md:flex md:justify-end md:max-w-7xl md:mx-auto z-40">
        <button
          onClick={handlePlaceOrder}
          disabled={submitting || cart.length === 0}
          className="w-full md:w-auto md:min-w-[300px] bg-primary text-white py-4 md:py-3 rounded-full font-bold text-lg md:text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
}
