'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import React from 'react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isAuthPage && <Navigation />}
      <main className={`flex-1 w-full ${!isAuthPage ? 'md:ml-64 pb-20 md:pb-0' : ''} overflow-x-hidden`}>
        {children}
      </main>
    </>
  );
}
