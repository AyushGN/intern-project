'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import React from 'react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isOrderSuccess = pathname === '/order-success';

  return (
    <>
      {!isAuthPage && !isOrderSuccess && <Navigation />}
      <main className={`flex-1 w-full ${!isAuthPage && !isOrderSuccess ? 'md:ml-64 pb-20 md:pb-0' : ''} overflow-x-hidden`}>
        {children}
      </main>
    </>
  );
}
