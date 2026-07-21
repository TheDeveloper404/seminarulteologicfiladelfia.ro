"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage, type ContactFormState } from "@/lib/contact/actions";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    sendContactMessage,
    null
  );

  return (
    <form
      action={(formData) => {
        formAction(formData);
      }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Nume</Label>
        <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon (opțional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={20} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mesaj</Label>
        <Textarea id="message" name="message" rows={5} required minLength={10} maxLength={2000} />
      </div>

      {/* Honeypot anti-spam — ascuns vizual, dar accesibil botilor care completează orice câmp */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="company">Companie</Label>
        <Input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Se trimite..." : "Trimite mesajul"}
      </Button>

      {state && "success" in state && (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-500">
          Mesajul a fost trimis. Îți vom răspunde în curând.
        </p>
      )}
      {state && "error" in state && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
