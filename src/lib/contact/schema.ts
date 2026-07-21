import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  // honeypot: câmp ascuns, trebuie să rămână gol — completat = bot
  company: z.string().max(0).optional().or(z.literal("")),
});
