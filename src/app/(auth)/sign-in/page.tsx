"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { signInSchema } from "@/lib/validations";
import { AuthField } from "@/components/auth/AuthField";
import { PasswordField } from "@/components/auth/PasswordField";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    };

    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const { error } = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back!");
    router.push(searchParams.get("callbackUrl") ?? "/browse");
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="border border-border bg-card p-6 md:p-8">
          <h1 className="text-2xl font-bold">Sign in to Deskdrop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buy and sell with fellow students
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <AuthField
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="you@university.edu"
              required
            />
            <PasswordField
              id="password"
              name="password"
              label="Password"
              autoComplete="current-password"
              minLength={8}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
