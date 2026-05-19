'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="bg-card rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
        <p className="text-muted mb-8">
          Your order has been successfully placed. You will receive a confirmation email shortly.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
          
          <Link
            href="/profile"
            className="w-full bg-border text-foreground font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition-all"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
