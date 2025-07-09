import React, { createContext, useEffect, useState } from "react";
import { getStoredToken, getUserInfo } from "../services/storage/asyncStorage";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  userInfo: null,
  setUserInfo: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getStoredToken();
        const storedUserInfo = await getUserInfo();
        
        if (token) {
          setIsAuthenticated(true);
          setUserInfo(storedUserInfo || {}); 
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  
  if (isLoading) {
    return null; 
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
