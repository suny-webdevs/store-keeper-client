"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner@storekeeper.dev",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await loginAction(data);
      if (res.ok) {
        toast.success("Welcome back! Redirecting to dashboard...");
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(res.error || "Invalid email or password");
        toast.error(res.error || "Authentication failed");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const fillQuickCredentials = (roleEmail: string) => {
    setValue("email", roleEmail);
    setValue("password", "password123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sign in to Store Keeper
          </h1>
          <p className="text-xs text-muted-foreground">
            Multi-branch retail & inventory management dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border border-border bg-card p-6 shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@store.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register("password")}
                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.password && (
                <p className="text-[11px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue to Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 border-t border-border pt-4">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Quick Test Accounts
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillQuickCredentials("owner@storekeeper.dev")}
                className="text-[10px] font-medium bg-muted/80 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/80 transition-colors"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("rafiq.manager@storekeeper.dev")}
                className="text-[10px] font-medium bg-muted/80 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/80 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("shirin.pos@storekeeper.dev")}
                className="text-[10px] font-medium bg-muted/80 hover:bg-muted text-foreground px-2 py-1 rounded border border-border/80 transition-colors"
              >
                Cashier
              </button>
            </div>
          </div>
        </Card>

        {/* Security / CSRF note */}
        <p className="text-center text-[11px] text-muted-foreground">
          Protected with SSR Supabase Auth & double-submit CSRF cookie token.
        </p>
      </div>
    </div>
  );
}
