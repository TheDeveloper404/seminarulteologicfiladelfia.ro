ALTER TABLE "students" ADD COLUMN "matricol_number" integer;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_matricol_number_unique" UNIQUE("matricol_number");