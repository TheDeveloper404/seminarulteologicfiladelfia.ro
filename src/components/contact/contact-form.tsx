"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere").max(100),
  email: z.string().trim().email("Adresă de email invalidă"),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "Mesajul trebuie să aibă cel puțin 10 caractere").max(2000),
  // honeypot: câmp ascuns, trebuie să rămână gol — completat = bot
  company: z.string().max(0).optional().or(z.literal("")),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (values.company) {
      // honeypot completat — respinge silențios, fără request către EmailJS
      setState("success");
      reset();
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setState("error");
      return;
    }

    setState("submitting");
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: values.name,
          from_email: values.email,
          phone: values.phone || "-",
          message: values.message,
        },
        { publicKey }
      );
      setState("success");
      reset();
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nume</Label>
        <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon (opțional)</Label>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mesaj</Label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {/* Honeypot anti-spam — ascuns vizual, dar accesibil botilor care completează orice câmp */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="company">Companie</Label>
        <Input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Button type="submit" disabled={state === "submitting"} className="w-full sm:w-auto">
        {state === "submitting" ? "Se trimite..." : "Trimite mesajul"}
      </Button>

      {state === "success" && (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-500">
          Mesajul a fost trimis. Îți vom răspunde în curând.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-sm font-medium text-destructive">
          A apărut o eroare la trimitere. Te rugăm încearcă din nou sau contactează-ne telefonic.
        </p>
      )}
    </form>
  );
}
