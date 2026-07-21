"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { loginAdmin, type AdminLoginState } from "@/lib/auth/admin-actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

// Dacă Turnstile e configurat, submit-ul așteaptă token-ul — altfel, la un submit rapid,
// verificarea eșuează pe server chiar cu parolă corectă (widget-ul se randează async).
const turnstileConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    null
  );
  const [turnstileReady, setTurnstileReady] = useState(!turnstileConfigured);

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
          <TurnstileWidget onReadyChange={setTurnstileReady} />
          {state?.error && (
            <p className="text-base text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full text-base"
            disabled={isPending || !turnstileReady}
          >
            {isPending
              ? "Se autentifică..."
              : !turnstileReady
                ? "Se verifică..."
                : "Autentificare"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
