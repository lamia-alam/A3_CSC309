import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { api } from "../config/api";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (utorid: string, password: string) => Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
};

type UserInfo = {
  id: string;
  utorid: string;
  birthday: string;
  email: string;
  role: string;
  name: string;
  avatarUrl: string;
  points: number;
  verified: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => console.log("Login function not implemented"),
  logout: () => console.log("Logout function not implemented"),
  userInfo: null,
  refreshUserInfo: async () => console.log("refreshUserInfo not implemented"),
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const login = async (utorid: string, password: string) => {
    const res = await api.post("/auth/tokens", {
      utorid,
      password,
    });
    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);
    } else {
      alert("Login failed");
    }
  };

  const refreshUserInfo = async () => {
    try {
      const res = await api.get("/users/me");
      setUserInfo(res.data);
    } catch (err) {
      console.error("Failed to refresh userInfo", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      refreshUserInfo();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserInfo();
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, userInfo, refreshUserInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);