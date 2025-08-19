import axios from "axios";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_URL } from "../config";

interface User {
  _id: any;
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "tester";
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login for demo purposes
  useEffect(() => {
    const checkAuth = () => {
      try {
        // In a real app, check token validity
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    let data;
    try {
      // Mock login - in a real app, this would call an API
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      if (!response.data.data.user.isApproved)
        throw new Error("User not approved");

      // For demo, any credentials work
      sessionStorage.setItem("user", JSON.stringify(response.data.data.user));
      sessionStorage.setItem("token", response.data.data.token);
      setUser(response.data.data.user);
      data = response.data.data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
