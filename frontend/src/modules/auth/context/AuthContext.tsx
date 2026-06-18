/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { login as loginApi, getMe, type Admin } from "../services/authApi";
import { ApiError } from "../../../shared/api/client";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem("token"),
    admin: null,
    isLoading: !!localStorage.getItem("token"),
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({
        token: null,
        admin: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    let cancelled = false;
    getMe()
      .then((res) => {
        if (!cancelled) {
          setState({
            token,
            admin: res.data,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("token");
          setState({
            token: null,
            admin: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await loginApi(username, password);
      localStorage.setItem("token", res.data.token);
      setState({
        token: res.data.token,
        admin: res.data.admin,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Error de conexión", 500);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({
      token: null,
      admin: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
