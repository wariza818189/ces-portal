"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { buttonStyles } from "@/components/ui/button-styles";
import { donationFieldStyles } from "@/components/donations/form-styles";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, { message: "" });
  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      <input type="hidden" name="next" value={next} />
      {state.message && <p id="login-error" role="alert" className="rounded-lg border border-error-border bg-error-surface p-4 text-sm text-error">{state.message}</p>}
      <fieldset disabled={pending} className="space-y-5">
        <div>
          <label htmlFor="login-username" className={donationFieldStyles.label}>Username</label>
          <input id="login-username" name="username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false}
            maxLength={64} aria-describedby={state.message ? "login-error" : undefined} className={donationFieldStyles.control} />
        </div>
        <div>
          <label htmlFor="login-password" className={donationFieldStyles.label}>Password</label>
          <input id="login-password" name="password" type="password" required autoComplete="current-password"
            aria-describedby={state.message ? "login-error" : undefined} className={donationFieldStyles.control} />
        </div>
        <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full disabled:opacity-60`}>
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </fieldset>
    </form>
  );
}
