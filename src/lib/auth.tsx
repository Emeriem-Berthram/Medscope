"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  exam: string;
  faculty: string;
  plan: "free" | "monthly" | "six_month" | "annual";
  questionsUsed: number;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  setProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "medscope_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const signIn = async (email: string, _password: string) => {
    // Demo mode: accepts any previously signed-up email, otherwise creates an account
    const stored = loadUser();
    if (stored && stored.email === email) {
      setUser(stored);
      return;
    }
    throw new Error("No account found for that email. Create a free account first.");
  };

  const signUp = async (name: string, email: string, _password: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      exam: "",
      faculty: "",
      plan: "free",
      questionsUsed: 0,
    };
    saveUser(newUser);
    setUser(newUser);
  };

  const signOut = () => {
    saveUser(null);
    setUser(null);
  };

  const setProfile = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
