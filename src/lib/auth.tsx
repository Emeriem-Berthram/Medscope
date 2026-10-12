"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  exam: string;
  faculty: string;
  plan: "free" | "monthly" | "six_month" | "annual";
  questionsUsed: number;
  inviteCode: string;
  referredBy: string;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    referredBy?: string
  ) => Promise<"signed-in" | "verification-required">;
  signOut: () => Promise<void>;
  setProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Profile data (exam, faculty, plan, invite code) lives in
// localStorage keyed by the Supabase user id, so the rest of
// the app keeps working unchanged.
const PROFILE_PREFIX = "medscope_profile_";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MD-${code}`;
}

function loadStoredProfile(id: string): User | null {
  try {
    const raw = localStorage.getItem(PROFILE_PREFIX + id);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveStoredProfile(user: User) {
  try {
    localStorage.setItem(PROFILE_PREFIX + user.id, JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

// Build the app's User from a Supabase auth user. Creates and
// persists a fresh profile (with invite code) on first sign-in.
function fromAuthUser(au: SupabaseUser): User {
  const stored = loadStoredProfile(au.id);
  if (stored && stored.email === au.email) return stored;
  const meta = (au.user_metadata ?? {}) as {
    name?: string;
    referred_by?: string;
  };
  const fresh: User = {
    id: au.id,
    email: au.email ?? "",
    name: meta.name ?? au.email?.split("@")[0] ?? "Doctor",
    exam: "",
    faculty: "",
    plan: "free",
    questionsUsed: 0,
    inviteCode: generateInviteCode(),
    referredBy: meta.referred_by ?? "",
  };
  saveStoredProfile(fresh);
  return fresh;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restore an existing session on load.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(fromAuthUser(session.user));
    });
    // Keep the session in sync (sign-in, sign-out, token refresh,
    // and the email-verification link completing sign-up).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(fromAuthUser(session.user));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("not verified")) {
        throw new Error(
          "Your email is not verified yet. Check your inbox for the Medscope verification link."
        );
      }
      if (msg.includes("invalid login")) {
        throw new Error("Wrong email or password. Try again.");
      }
      throw new Error(error.message);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    referredBy: string = ""
  ): Promise<"signed-in" | "verification-required"> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, referred_by: referredBy },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/app`
            : undefined,
      },
    });
    if (error) throw new Error(error.message);
    if (data.user && !data.session) {
      // Email confirmation is on — the user must open the
      // verification link before they can sign in.
      return "verification-required";
    }
    if (data.user) {
      setUser(fromAuthUser(data.user));
    }
    return "signed-in";
  };

  const signOut = async () => {
    setUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const setProfile = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveStoredProfile(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signOut, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
