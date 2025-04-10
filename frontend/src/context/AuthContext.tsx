import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../config/api";

export type UserInfo = {
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
  login: (utorid: string, password: string) => void;
  logout: () => void;
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
  viewAsRole: UserInfo['role'] | null;
  setViewAsRole: (role: UserInfo['role'] | null) => void;
  loading: boolean;
  role: UserInfo["role"] | null;
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
  const [viewAsRole, setViewAsRole] = useState<UserInfo['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (utorid: string, password: string) => {
    setLoading(true);
    api.post("/auth/tokens", {
      utorid,
      password,
    }).then(res => {
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        setIsAuthenticated(true);
      }
    }).catch(() => {
      alert("Login failed");
    });
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

  const computedRole: UserInfo['role'] | null = viewAsRole ?? userInfo?.role ?? null;

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