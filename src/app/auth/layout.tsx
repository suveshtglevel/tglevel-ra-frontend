import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Securely sign in to the Research Analyst Panel.',
};

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
