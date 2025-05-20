import React, { useContext, useEffect } from 'react';
import { router } from 'expo-router';
import {AuthContext} from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login'); // Redirect to login page
    }
  }, [isAuthenticated]);

  // Optionally show nothing while redirecting
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
