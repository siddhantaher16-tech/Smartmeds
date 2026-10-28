import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { TOKEN_KEY } from "../constants";
import { getMe } from "../services/authService";
import type { Profile } from "../types";

interface AuthContextType {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    access_token: string,
    refresh_token: string,
    expires_at: number,
    userProfile: Profile,
  ) => void;
  logout: () => void;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // loading stays true until we know auth status — prevents premature redirects
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        // No token — nothing to restore
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();
        // Backend returns { statusCode: 200, data: { profile } }
        if (res?.statusCode === 200 && res?.data?.profile) {
          setProfile(res.data.profile);
          setIsAuthenticated(true);
        } else {
          // Unexpected response shape — treat as unauthenticated
          clearStorage();
          setIsAuthenticated(false);
          setProfile(null);
        }
      } catch {
        // Token invalid / network error — clear everything
        clearStorage();
        setIsAuthenticated(false);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_at");
  };

  const login = (
    access_token: string,
    refresh_token: string,
    expires_at: number,
    userProfile: Profile,
  ) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_at", expires_at.toString());
    setProfile(userProfile);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearStorage();
    setProfile(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ profile, isAuthenticated, loading, login, logout, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
