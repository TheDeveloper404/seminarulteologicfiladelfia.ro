import { describe, expect, it } from "vitest";
import { contactSchema } from "./schema";

const validPayload = {
  name: "Ion Popescu",
  email: "ion@example.com",
  phone: "0722123456",
  message: "Bună ziua, aș dori informații despre admitere.",
  company: "",
};

describe("contactSchema", () => {
  it("accepts a valid payload", () => {
    expect(contactSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects when the honeypot field is filled (bot detection)", () => {
    const result = contactSchema.safeParse({ ...validPayload, company: "Acme Inc" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    const result = contactSchema.safeParse({ ...validPayload, message: "scurt" });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = contactSchema.safeParse({ ...validPayload, name: "A" });
    expect(result.success).toBe(false);
  });

  it("allows an empty phone (optional field)", () => {
    const result = contactSchema.safeParse({ ...validPayload, phone: "" });
    expect(result.success).toBe(true);
  });
});
