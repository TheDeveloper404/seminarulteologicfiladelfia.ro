"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin, type AdminLoginState } from "@/lib/auth/admin-actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    null
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Autentificare admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Se autentifică..." : "Autentificare"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
