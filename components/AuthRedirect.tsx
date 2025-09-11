import { useAuth } from '@/src/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, loading]);

  return null;
}
