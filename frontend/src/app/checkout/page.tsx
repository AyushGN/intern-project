'use client';

import { ChevronLeft, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  
  const originalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const delivery = originalPrice > 0 ? 40 : 0;
  const gst = originalPrice > 0 ? Math.round(originalPrice * 0.18) : 0;
  const discount = originalPrice > 0 ? 20 : 0;
  const finalTotal = originalPrice > 0 ? originalPrice + delivery + gst - discount : 0;

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 bg-gray-50 md:bg-transparent">
      {/* Header */}
      <div className="bg-white px-4 py-4 md:py-8 flex items-center sticky top-0 z-10 md:static md:bg-transparent md:mb-4">
        <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-primary transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold ml-2">Checkout</h1>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-32 md:pb-8">
        
        {/* Left Column (Items & Shipping) */}
        <div className="md:col-span-7 space-y-6">
          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link href="/explore" className="text-primary font-bold hover:underline">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center relative">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    &times;
                  </button>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0">
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
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-500 text-sm">Shipping Details</h3>
              <button className="text-primary text-sm font-semibold hover:underline">Edit</button>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-800">Michael Miller</h4>
                  <span className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/20">Home</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  70 Washington Square South, New York,<br/>NY 10012, United States
                </p>
                <p className="text-sm text-gray-600">+91 12345 67890</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline">
                Add Delivery Instructions
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Invoice) */}
        <div className="md:col-span-5 space-y-6">
          {/* Coupon */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 text-primary font-semibold">
              <Tag size={20} />
              <span>Apply Coupon</span>
            </div>
            <ChevronLeft size={20} className="text-gray-400 rotate-180" />
          </div>

          {/* Invoice */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-500 text-sm mb-4">Invoice</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price</span>
                <span className="font-medium text-gray-800">₹{originalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-red-500">+{delivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST</span>
                <span className="font-medium text-red-500">+{gst}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-primary">-{discount}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-primary">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-[72px] md:bottom-8 left-0 md:left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 md:border-none md:bg-transparent md:flex md:justify-end md:max-w-7xl md:mx-auto z-40">
        <button className="w-full md:w-auto md:min-w-[300px] bg-primary text-white py-4 md:py-3 rounded-full font-bold text-lg md:text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
