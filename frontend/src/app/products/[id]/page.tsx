'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, ShoppingCart, Package, Loader2, Store } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  users?: {
    name: string;
    store_name?: string;
    location?: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
      } else {
        router.push('/explore');
      }
    } catch (error) {
      router.push('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '/images/berries.png',
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  const CATEGORY_EMOJIS: Record<string, string> = {
    fruits: '🍎', vegetables: '🥦', grains: '🌾', herbs: '🌿',
    dairy: '🥛', spices: '🌶️', other: '📦',
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-4 md:pt-8">
      {/* Back */}
      <Link href="/explore" className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Explore</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-background shadow-sm border border-border">
            <img
              src={product.image_url || '/images/berries.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full capitalize text-muted border border-border">
            {CATEGORY_EMOJIS[product.category] || '📦'} {product.category}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-yellow-500">
              {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
            </div>
            <span className="text-sm text-gray-400">(Fresh from farm)</span>
          </div>

          <p className="text-4xl font-extrabold text-primary mb-1">
            ₹{product.price}
            <span className="text-lg text-gray-400 font-normal ml-1">/ {product.unit}</span>
          </p>

          {product.description && (
            <p className="text-muted text-sm leading-relaxed mt-4 mb-6">
              {product.description}
            </p>
          )}

          {/* Stock info */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Package size={16} className={product.stock_quantity > 10 ? 'text-green-500' : 'text-orange-500'} />
            <span className={product.stock_quantity > 10 ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Farmer info */}
          {product.users && (
            <div className="bg-primary-light rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  <Store size={18} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{product.users.store_name || product.users.name}</p>
                  {product.users.location && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <MapPin size={12} /> {product.users.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-foreground">Quantity</span>
            <div className="flex items-center gap-3 bg-border rounded-full px-4 py-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-6 h-6 flex items-center justify-center font-bold text-muted hover:text-primary transition-colors"
              >−</button>
              <span className="font-bold text-foreground min-w-[2ch] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                className="w-6 h-6 flex items-center justify-center font-bold text-muted hover:text-primary transition-colors"
              >+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
              added
                ? 'bg-green-500 text-white shadow-green-200'
                : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02]'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            <ShoppingCart size={22} />
            {added ? 'Added to Cart! ✓' : `Add ${quantity > 1 ? `${quantity}x` : ''} to Cart — ₹${(product.price * quantity).toFixed(0)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
