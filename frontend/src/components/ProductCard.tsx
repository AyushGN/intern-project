'use client';

import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-red-500" : ""} />
        </button>
      </div>
      
      <h3 className="font-semibold text-foreground text-sm mb-1">{product.name}</h3>
      
      <div className="flex justify-between items-center mb-3 text-xs">
        <span className="font-bold text-base">₹{product.price}</span>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={12} fill="currentColor" />
          <span className="text-gray-600 font-medium">{product.rating} <span className="text-gray-400 font-normal">({product.reviews})</span></span>
        </div>
      </div>
      
      <button 
        onClick={() => addToCart(product)}
        className="w-full mt-auto py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}
