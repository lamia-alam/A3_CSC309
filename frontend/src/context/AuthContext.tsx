import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../config/api";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (utorid: string, password: string) => Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
  loading: boolean;
};

type UserInfo = {
  id: string;
  utorid: string;
  birthday: string;
  email: string;
  role: "cashier" | "manager" | "superuser" | "regular";
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
  loading: false,
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const login = async (utorid: string, password: string) => {
    setLoading(true);
    const res = await api.post("/auth/tokens", {
      utorid,
      password,
    });
    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
    } else {
      alert("Login failed");
    }
    setIsAuthenticated(true);
    setLoading(false);
  };

  const getUserInfo = async () => {
    const res = await api.get("/users/me");
    setUserInfo(res.data);
  };

  const logout = () => {
    setLoading(true);
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem("token");
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      getUserInfo();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getUserInfo();
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, userInfo, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
