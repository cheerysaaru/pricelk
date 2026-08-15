"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/lib/hooks/use-auth";

export function LoginButton() {
  const { user, ready, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!ready) {
    return <div className="h-10 w-24 rounded-lg bg-zinc-100" aria-hidden />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
          title={user.email}
        >
          {user.name.charAt(0).toUpperCase()}
        </span>
        <button
          onClick={signOut}
          className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 sm:flex"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Sign in
      </Button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}