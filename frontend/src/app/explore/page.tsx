'use client';

import { Heart, Filter, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

const PRODUCTS = [
  { id: '1', name: 'Berries', price: 500, rating: 4.5, reviews: 672, image: '/images/berries.png', category: 'fruits' },
  { id: '2', name: 'Tulsi', price: 100, rating: 4.9, reviews: 324, image: '/images/tulsi.png', category: 'herbs' },
  { id: '3', name: 'Wheat', price: 800, rating: 4.9, reviews: 526, image: '/images/berries.png', category: 'grains' }, // reusing images for mock
  { id: '4', name: 'Apples', price: 120, rating: 4.2, reviews: 468, image: '/images/tomatoes.png', category: 'fruits' },
  { id: '5', name: 'Milk', price: 70, rating: 4.9, reviews: 560, image: '/images/milk.png', category: 'dairy' },
  { id: '6', name: 'Tomatos', price: 50, rating: 4.7, reviews: 874, image: '/images/tomatoes.png', category: 'veg' },
  { id: '7', name: 'Carrots', price: 40, rating: 4.6, reviews: 231, image: '/images/tomatoes.png', category: 'veg' },
  { id: '8', name: 'Mint Leaves', price: 30, rating: 4.8, reviews: 156, image: '/images/tulsi.png', category: 'herbs' },
  { id: '9', name: 'Rice', price: 450, rating: 4.4, reviews: 890, image: '/images/berries.png', category: 'grains' },
  { id: '10', name: 'Pomegranate', price: 150, rating: 4.9, reviews: 412, image: '/images/pomegranate.png', category: 'fruits' },
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = PRODUCTS.filter(product => {
    return activeCategory === 'all' || product.category === activeCategory;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="md:hidden p-2 -ml-2 text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-primary">Explore</h1>
        </div>
        
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-primary transition-colors">
            <Heart size={20} />
          </button>
          <button className="p-2 rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-primary transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Categories</h2>
        </div>
        <CategoryPills activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No products found for this category.</p>
        )}
      </div>
    </div>
  );
}
