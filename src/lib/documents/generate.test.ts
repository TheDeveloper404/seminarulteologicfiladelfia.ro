import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generateGraduationPdf } from "./generate";
import type { students } from "@/db/schema";

type Student = typeof students.$inferSelect;

function mockStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 1,
    publicId: "TEST01",
    fullName: "Popescu Ion",
    phone: null,
    email: null,
    enrollmentYear: 2024,
    studyYear: 2,
    graduated: true,
    graduatedAt: new Date("2026-06-15"),
    birthDate: "1998-03-12",
    birthLocality: "Petroșani",
    birthCounty: "Hunedoara",
    address: null,
    baptismDate: null,
    homeChurch: null,
    notes: null,
    isHistoricalImport: false,
    createdAt: new Date(),
    ...overrides,
  } as Student;
}

describe("generateGraduationPdf", () => {
  it("generates a valid single-page A4-landscape PDF for a diplomă", async () => {
    const bytes = await generateGraduationPdf({
      student: mockStudent(),
      type: "diploma",
      issueNumber: "12",
      issueDate: new Date("2026-08-19"),
    });

    expect(bytes.byteLength).toBeGreaterThan(0);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBeCloseTo(841.89, 0);
    expect(height).toBeCloseTo(595.28, 0);
  });

  it("generates a valid PDF for a certificat", async () => {
    const bytes = await generateGraduationPdf({
      student: mockStudent(),
      type: "certificat",
      issueNumber: "7",
      issueDate: new Date("2026-08-19"),
    });

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("does not throw when birth data is missing (blanks stay unfilled, not crash)", async () => {
    const student = mockStudent({
      birthDate: null,
      birthLocality: null,
      birthCounty: null,
    });

    await expect(
      generateGraduationPdf({
        student,
        type: "diploma",
        issueNumber: "1",
        issueDate: new Date("2026-08-19"),
      })
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  it("does not throw for a name with full Romanian diacritics", async () => {
    const student = mockStudent({ fullName: "Ștefănescu Ițcăriță-Vâlceanu" });

    await expect(
      generateGraduationPdf({
        student,
        type: "certificat",
        issueNumber: "1",
        issueDate: new Date("2026-08-19"),
      })
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});
