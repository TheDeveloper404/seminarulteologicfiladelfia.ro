import { randomInt } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";

// Exclude caractere ambigue (0/O, 1/I/L) — ID-ul e citit/copiat de mână de studenți.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 6;
const MAX_ATTEMPTS = 10;

function randomCandidate(): string {
  let id = "";
  for (let i = 0; i < LENGTH; i++) {
    id += ALPHABET[randomInt(ALPHABET.length)];
  }
  return id;
}

export async function generateUniquePublicId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = randomCandidate();
    const [existing] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.publicId, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  throw new Error("Nu s-a putut genera un ID unic după mai multe încercări.");
}
