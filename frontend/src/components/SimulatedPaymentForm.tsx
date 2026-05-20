'use client';

import { useState } from 'react';
import { CreditCard, Calendar, Lock, Loader2 } from 'lucide-react';

interface SimulatedPaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function SimulatedPaymentForm({ amount, onSuccess, onError }: SimulatedPaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 19) {
      onError('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      onError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      onError('Please enter a valid CVC.');
      return;
    }

    setProcessing(true);
    
    // Simulate network delay and gateway processing (Stripe Test Mode behavior)
    setTimeout(() => {
      // 10% chance to simulate a declined card for realism if card ends in '4' (standard Stripe test failure)
      if (cardNumber.endsWith('4')) {
        setProcessing(false);
        onError('Your card was declined. Please try a different card.');
      } else {
        setProcessing(false);
        onSuccess();
      }
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 md:p-6 border border-border rounded-xl bg-card">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <CreditCard size={18} className="text-primary" />
          Payment Details
        </h3>
        <p className="text-sm text-muted">Complete your secure payment (Simulated Test Mode)</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
              className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <CreditCard size={16} className="absolute left-3 top-3 text-muted" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
            <div className="relative">
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                required
                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Calendar size={16} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CVC</label>
            <div className="relative">
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123"
                maxLength={4}
                required
                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Lock size={16} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full mt-6 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount}`
        )}
      </button>
      
      <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-muted font-medium uppercase tracking-wider">
        <Lock size={10} />
        Secured by Mock Gateway
      </div>
    </form>
  );
}
