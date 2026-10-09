"use client";

import { useActionState } from "react";
import { logout } from "@/lib/actions/auth";
import { buttonStyles } from "@/components/ui/button-styles";

export function LogoutForm() {
  const [state, action, pending] = useActionState(logout, { message: "" });
  return (
    <form action={action} className="min-w-0" aria-busy={pending}>
      <button type="submit" disabled={pending} className={`${buttonStyles.secondary} disabled:opacity-60`}>
        {pending ? "Signing out..." : "Sign Out"}
      </button>
      {state.message && <p role="alert" className="mt-2 text-sm text-error">{state.message}</p>}
    </form>
  );
}
