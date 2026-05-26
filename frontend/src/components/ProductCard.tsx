'use client';

import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import { getProductFallbackImage } from '@/utils/fallbackImage';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  unit?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-card rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-border flex flex-col h-full">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-background">
          <img 
            src={product.image || getProductFallbackImage(product.name, '')} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-red-500" : ""} />
          </button>
        </div>
        
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{product.name}</h3>
        
        <div className="flex justify-between items-center mb-3 text-xs">
          <span className="font-bold text-base">₹{product.price}{product.unit ? <span className="text-gray-400 font-normal text-xs">/{product.unit}</span> : ''}</span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={12} fill="currentColor" />
            <span className="text-muted font-medium">{product.rating}</span>
          </div>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className={`w-full mt-auto py-2 rounded-full text-sm font-semibold transition-all ${
            added 
              ? 'bg-green-500 text-white' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {added ? 'Added! ✓' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
