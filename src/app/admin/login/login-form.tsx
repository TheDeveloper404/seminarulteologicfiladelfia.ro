"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { loginAdmin, type AdminLoginState } from "@/lib/auth/admin-actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    null
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Autentificare admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="h-11 md:text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-base">
              Parolă
            </Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              className="h-11 md:text-base"
              required
            />
          </div>
          {state?.error && (
            <p className="text-base text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full text-base" disabled={isPending}>
            {isPending ? "Se autentifică..." : "Autentificare"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
