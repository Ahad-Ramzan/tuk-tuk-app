import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import AuthAPI from "../services/api/authApi";
import { clearStorage } from "@/services/storage/asyncStorage";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setIsAuthenticated, setUserInfo } = useContext(AuthContext);

  // Login Hook
  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setError(null);

      try {
        const userData = await AuthAPI.login(email, password);
        setIsAuthenticated(true);
        setUserInfo(userData.user);      

        return userData;
      } catch (err) {
        setError(err.response?.data?.message || "Login failed");
        setIsAuthenticated(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsAuthenticated, setUserInfo]
  );

  // Logout Hook
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await AuthAPI.logout();

      // Clear context
      setIsAuthenticated(false);
      setUserInfo(null);
      clearStorage();

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Logout failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setIsAuthenticated, setUserInfo]);

  return {
    login,
    logout,
    isLoading,
    error,
  };
};

export default useAuth;
