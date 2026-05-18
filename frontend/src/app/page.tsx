'use client';

import { Search, Bell, Settings2, Coins } from 'lucide-react';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { useState } from 'react';

const PRODUCTS = [
  { id: '1', name: 'Berries', price: 500, rating: 4.5, reviews: 672, image: '/images/berries.png', category: 'fruits' },
  { id: '2', name: 'Tulsi', price: 100, rating: 4.9, reviews: 324, image: '/images/tulsi.png', category: 'herbs' },
  { id: '3', name: 'Milk', price: 70, rating: 4.9, reviews: 560, image: '/images/milk.png', category: 'dairy' },
  { id: '4', name: 'Tomatos', price: 50, rating: 4.7, reviews: 874, image: '/images/tomatoes.png', category: 'veg' },
  { id: '5', name: 'Wheat', price: 200, rating: 4.8, reviews: 150, image: '/images/berries.png', category: 'grains' }, // using berries image as placeholder
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header Mobile / Top Section */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Fresh Market Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold text-primary">Fresh Market</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 bg-primary-light px-3 py-1 rounded-full border border-primary/20">
            <Coins size={14} className="text-primary" />
            <span className="text-xs font-bold text-primary">50</span>
          </div>
          <button className="p-2 rounded-full bg-gray-50 border border-gray-100">
            <Bell size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Header Top Section (Hidden on Mobile since Sidebar handles logo) */}
      <div className="hidden md:flex justify-end items-center mb-8 gap-4">
         <div className="flex items-center gap-2 bg-primary-light px-4 py-2 rounded-full border border-primary/20">
            <Coins size={16} className="text-primary" />
            <span className="font-bold text-primary">50 Coins</span>
          </div>
          <button className="p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
            <Bell size={20} className="text-gray-600" />
          </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search products, farms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
        <Link href="/explore" className="p-3 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-primary transition-colors flex items-center justify-center">
          <Settings2 size={20} />
        </Link>
      </div>

      {/* Promo Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 bg-[#E9D9C9] h-40 md:h-56">
        <img 
          src="/images/promo_banner.png" 
          alt="Are you a Farmer? Sell your products here" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center items-start w-2/3">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2 drop-shadow-md">Are you a <span className="text-primary-light">Farmer ?</span></h2>
          <p className="text-white font-medium text-sm md:text-base mb-4 drop-shadow-md">Sell your <span className="italic">Products here</span></p>
          <Link href="/register?role=farmer" className="bg-white text-primary px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-md hover:bg-gray-100 transition-colors inline-block text-center">
            Get Started
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Categories</h2>
          <Link href="/explore" className="text-primary text-sm font-semibold hover:underline">View all</Link>
        </div>
        <CategoryPills activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      </div>

      {/* Browse Products Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Browse Products</h2>
          <Link href="/explore" className="text-primary text-sm font-semibold hover:underline">View all</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
