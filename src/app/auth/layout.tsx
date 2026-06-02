import React from 'react';
import type { Metadata } from 'next';
import RedirectIfAuth from '@/components/auth/RedirectIfAuth';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Securely sign in to the Research Analyst Panel.',
};

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <RedirectIfAuth>{children}</RedirectIfAuth>;
}
