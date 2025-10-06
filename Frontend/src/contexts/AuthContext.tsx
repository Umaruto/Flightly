import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  addBooking: (booking: any) => void;
  cancelTicket: (ticketId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const login = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const addBooking = (booking: any) => {
    const current = user || {};
    const nextUser = {
      ...current,
      bookings: [...(current.bookings || []), booking],
    };
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const cancelTicket = (ticketId: number) => {
    if (!user) return;
    const nextUser = {
      ...user,
      bookings: (user.bookings || []).map((b: any) => ({
        ...b,
        tickets: (b.tickets || []).map((t: any) =>
          t.id === ticketId
            ? { ...t, status: "CANCELED", canceledAt: new Date().toISOString() }
            : t
        ),
      })),
    };
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, addBooking, cancelTicket }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
