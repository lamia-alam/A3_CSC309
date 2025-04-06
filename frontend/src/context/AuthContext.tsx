import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../config/api";

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

type AuthContextType = {
  isAuthenticated: boolean;
  login: (utorid: string, password: string) => Promise<void>;
  logout: () => void;
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
  viewAsRole: string | null;
  setViewAsRole: (role: string | null) => void;
  loading: boolean;
  role: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => console.log("Login function not implemented"),
  logout: () => console.log("Logout function not implemented"),
  userInfo: null,
  refreshUserInfo: async () => {},
  viewAsRole: null,
  setViewAsRole: () => {},
  loading: false,
  role: null,
});

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [viewAsRole, setViewAsRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (utorid: string, password: string) => {
    setLoading(true);
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
    setLoading(false);
  };

  const refreshUserInfo = async () => {
    try {
      const res = await api.get("/users/me");
      setUserInfo(res.data);
    } catch (err) {
      console.error("Failed to refresh user info:", err);
    }
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserInfo(null);
    setViewAsRole(null);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      refreshUserInfo();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserInfo();
    }
  }, [isAuthenticated]);

  const computedRole = viewAsRole ?? userInfo?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        userInfo,
        refreshUserInfo,
        viewAsRole,
        setViewAsRole,
        loading,
        role: computedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);