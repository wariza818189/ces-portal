import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { safeReturnPath } from "@/lib/auth/policy.mjs";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const next = safeReturnPath((await searchParams).next);
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">Community Extension Services</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Staff Sign In</h1>
        <p className="mt-3 text-base leading-6 text-muted-foreground">Use your CES staff account to access the staff workspace.</p>
      </header>
      <Card><LoginForm next={next} /></Card>
    </div>
  );
}
