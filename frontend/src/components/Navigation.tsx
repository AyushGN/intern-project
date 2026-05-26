'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ShoppingCart, User, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Cart', href: '/checkout', icon: ShoppingCart },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 pt-8 pb-4 px-4 z-50">
        <div className="flex items-center gap-2 px-2 mb-12">
          <img src="/images/logo.png" alt="Fresh Market Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-primary">Fresh Market</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isCart = item.name === 'Cart';
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-muted hover:bg-primary-light hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-white' : ''} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isCart && cartCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-card text-primary' : 'bg-primary text-white'}`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
          
          {user?.role === 'FARMER' && (
            <Link
              href="/farmer/dashboard"
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname.startsWith('/farmer')
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-muted hover:bg-primary-light hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} className={pathname.startsWith('/farmer') ? 'text-white' : ''} />
                <span className="font-medium">Dashboard</span>
              </div>
            </Link>
          )}
          
          {user?.role === 'SHOP' && (
            <Link
              href="/shop/dashboard"
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname.startsWith('/shop')
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-muted hover:bg-primary-light hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} className={pathname.startsWith('/shop') ? 'text-white' : ''} />
                <span className="font-medium">Shop Dashboard</span>
              </div>
            </Link>
          )}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-border">
          <div className="bg-primary-light rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-primary mb-2">Are you a Farmer?</p>
            <Link href="/register?role=farmer" className="block w-full bg-primary text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-primary/90 transition-colors relative z-10 cursor-pointer pointer-events-auto">
              Sell Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe rounded-t-3xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isCart = item.name === 'Cart';
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 relative ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary-light' : 'bg-transparent'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isCart && cartCount > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 h-0 transform translate-y-2'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {user?.role === 'FARMER' && (
          <Link
            href="/farmer/dashboard"
            className={`flex flex-col items-center gap-1 relative ${pathname.startsWith('/farmer') ? 'text-primary' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-full transition-all duration-300 ${pathname.startsWith('/farmer') ? 'bg-primary-light' : 'bg-transparent'}`}>
              <LayoutDashboard size={24} strokeWidth={pathname.startsWith('/farmer') ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-all duration-300 ${pathname.startsWith('/farmer') ? 'opacity-100 transform translate-y-0' : 'opacity-0 h-0 transform translate-y-2'}`}>
              Dashboard
            </span>
          </Link>
        )}

        {user?.role === 'SHOP' && (
          <Link
            href="/shop/dashboard"
            className={`flex flex-col items-center gap-1 relative ${pathname.startsWith('/shop') ? 'text-primary' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-full transition-all duration-300 ${pathname.startsWith('/shop') ? 'bg-primary-light' : 'bg-transparent'}`}>
              <LayoutDashboard size={24} strokeWidth={pathname.startsWith('/shop') ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-all duration-300 ${pathname.startsWith('/shop') ? 'opacity-100 transform translate-y-0' : 'opacity-0 h-0 transform translate-y-2'}`}>
              Shop
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}
