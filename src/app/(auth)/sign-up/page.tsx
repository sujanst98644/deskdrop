"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { signUpSchema } from "@/lib/validations";
import { AuthField } from "@/components/auth/AuthField";
import { PasswordField } from "@/components/auth/PasswordField";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const confirm = String(formData.get("confirm"));
    const raw = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    };

    if (raw.password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);

    // Better Auth signs the new user in as part of sign-up.
    const { error } = await signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.code === "USER_ALREADY_EXISTS"
          ? "Email already in use."
          : error.message ?? "Could not create account."
      );
      return;
    }

    toast.success("Account created!");
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="border border-border bg-card p-6 md:p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Deskdrop in seconds
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <AuthField
              id="name"
              name="name"
              type="text"
              label="Name"
              autoComplete="name"
              placeholder="Asha Sharma"
              required
            />
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
              autoComplete="new-password"
              hint="At least 8 characters."
              minLength={8}
              required
            />
            <PasswordField
              id="confirm"
              name="confirm"
              label="Confirm password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
