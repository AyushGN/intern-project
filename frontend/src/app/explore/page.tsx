'use client';

import { Heart, Filter, ChevronLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';
import { getProductFallbackImage } from '@/utils/fallbackImage';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  description?: string;
  users?: {
    name: string;
    store_name?: string;
    location?: string;
  };
}

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="md:hidden p-2 -ml-2 text-muted">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Explore</h1>
        </div>
        
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-card border border-border shadow-sm text-muted hover:text-primary transition-colors">
            <Heart size={20} />
          </button>
          <button className="p-2 rounded-full bg-card border border-border shadow-sm text-muted hover:text-primary transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>
      </form>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Categories</h2>
        </div>
        <CategoryPills activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-8">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  rating: 4.5,
                  reviews: 0,
                  image: product.image_url || getProductFallbackImage(product.name, product.category),
                }}
              />
            ))
          ) : (
            <p className="text-muted col-span-full text-center py-10">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}
