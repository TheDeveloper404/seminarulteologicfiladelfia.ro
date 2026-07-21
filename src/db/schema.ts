import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Setare unică (singleton) pentru parola comună de acces a studenților.
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  sharedPasswordHash: text("shared_password_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  // ID de login: generat aleator la creare, nu secvențial (vezi
  // docs/decizie-infrastructura-si-functionalitati-noi.md secțiunea 7).
  publicId: varchar("public_id", { length: 12 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 255 }),
  enrollmentYear: integer("enrollment_year").notNull(),
  // Anul curent de studiu (1 sau 2) — actualizat manual de admin, nu există calendar academic
  // din care platforma să-l deducă automat.
  studyYear: integer("study_year").notNull().default(1),
  graduated: boolean("graduated").notNull().default(false),
  graduatedAt: timestamp("graduated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courseMaterials = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Nume de fișier pe disc (generat, ex. UUID+extensie) — nu vine din input-ul utilizatorului.
  filePath: text("file_path").notNull(),
  // Numele original al fișierului, doar pentru afișare/descărcare (Content-Disposition).
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  sessionDate: date("session_date").notNull(),
  present: boolean("present").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sesiuni server-side pe cookie (fără JWT). `id` e hash-ul (sha256) al token-ului din cookie,
// niciodată token-ul brut — dacă baza de date e compromisă, token-urile din cookie-urile
// utilizatorilor rămân neexploatabile.
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  role: varchar("role", { length: 10 }).notNull(), // "admin" | "student"
  adminId: integer("admin_id").references(() => admins.id, { onDelete: "cascade" }),
  studentId: integer("student_id").references(() => students.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 255 }).notNull(),
  grade: numeric("grade", { precision: 4, scale: 2 }).notNull(),
  gradedAt: date("graded_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
