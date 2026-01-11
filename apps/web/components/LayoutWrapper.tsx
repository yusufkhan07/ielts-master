'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show header on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <>
      {!isAuthPage && <Header />}
      {children}
    </>
  );
}
