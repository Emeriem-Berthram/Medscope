"use client";

import { useEffect } from "react";

// Supabase email links (email verification, password
// reset) land on the site root with the token in the
// URL hash. The Supabase client picks the session up
// from that hash automatically — then we route the
// user to the right page and strip the hash.
export default function HashHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    window.history.replaceState(null, "", window.location.pathname);
    if (type === "recovery") {
      window.location.href = "/reset-password";
    } else {
      window.location.href = "/app";
    }
  }, []);
  return null;
}
