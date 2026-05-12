'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
