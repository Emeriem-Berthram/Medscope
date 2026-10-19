"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
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
  onboardingCompleted?: boolean;
  diagnosticScore?: number;
  targetSittingDate?: string;
  targetLevel?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    referredBy?: string
  ) => Promise<"signed-in" | "verification-required" | "already-registered">;
  signOut: () => Promise<void>;
  setProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

// Build the app's User from a Supabase auth user, and sync with database profiles
async function syncUserProfile(au: SupabaseUser): Promise<User> {
  const stored = loadStoredProfile(au.id);
  const meta = (au.user_metadata ?? {}) as {
    name?: string;
    referred_by?: string;
  };

  let dbName = meta.name;
  let dbCollege = "";
  let dbFaculty = "";

  try {
    const { data } = await supabase
      .from("profiles")
      .select("name, college, faculty, onboarding_completed")
      .eq("id", au.id)
      .maybeSingle();
    if (data) {
      if (data.name) dbName = data.name;
      if (data.college) dbCollege = data.college;
      if (data.faculty) dbFaculty = data.faculty;
    }
  } catch {
    // Supabase query fallback
  }

  const resolvedName =
    dbName || stored?.name || meta.name || au.email?.split("@")[0] || "Doctor";

  const fresh: User = {
    id: au.id,
    email: au.email ?? "",
    name: resolvedName,
    exam: dbCollege || stored?.exam || "",
    faculty: dbFaculty || stored?.faculty || "",
    plan: stored?.plan || "free",
    questionsUsed: stored?.questionsUsed || 0,
    inviteCode: stored?.inviteCode || generateInviteCode(),
    referredBy: stored?.referredBy || meta.referred_by || "",
    onboardingCompleted:
      stored?.onboardingCompleted ?? (dbCollege && dbFaculty ? true : false),
  };
  saveStoredProfile(fresh);
  return fresh;
}

function fromAuthUserFast(au: SupabaseUser): User {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore an existing session on load.
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          const u = await syncUserProfile(session.user);
          setUser(u);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    // Keep the session in sync (sign-in, sign-out, token refresh,
    // and the email-verification link completing sign-up).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const u = await syncUserProfile(session.user);
        setUser(u);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("not verified")) {
        throw new Error(
          "Your email is registered but not confirmed yet. Check your inbox for the verification link, click 'Resend verification', or run the auto-confirm SQL in Supabase."
        );
      }
      if (
        msg.includes("invalid login") ||
        msg.includes("invalid_credentials") ||
        msg.includes("invalid credentials")
      ) {
        throw new Error(
          "Wrong email or password. Please verify your credentials and try again."
        );
      }
      throw new Error(error.message);
    }
    if (data?.user) {
      const u = await syncUserProfile(data.user);
      setUser(u);
      return u;
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    referredBy: string = ""
  ): Promise<"signed-in" | "verification-required" | "already-registered"> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Pre-check if member already exists in database profiles
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", cleanEmail)
        .maybeSingle();
      if (existingProfile) {
        return "already-registered";
      }
    } catch {
      // Continue to Supabase signUp
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: name.trim(), referred_by: referredBy },
        emailRedirectTo: getAuthRedirectUrl("/login?verified=true"),
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user_already_exists")
      ) {
        return "already-registered";
      }
      throw new Error(error.message);
    }

    // Supabase v2 returns identities: [] when the user email already exists!
    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      return "already-registered";
    }

    if (data.user && !data.session) {
      return "verification-required";
    }

    if (data.user) {
      const u = await syncUserProfile(data.user);
      setUser(u);
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
      value={{ user, loading, signIn, signUp, signOut, setProfile }}
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
