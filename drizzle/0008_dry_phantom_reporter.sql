CREATE TYPE "public"."graduation_document_type" AS ENUM('diploma', 'certificat');--> statement-breakpoint
CREATE TABLE "graduation_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"type" "graduation_document_type" NOT NULL,
	"issue_number" varchar(50) NOT NULL,
	"issue_date" date NOT NULL,
	"file_path" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "birth_locality" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "birth_county" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "baptism_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "home_church" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "is_historical_import" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "graduation_documents" ADD CONSTRAINT "graduation_documents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;