CREATE TABLE "student_tuition" (
	"id" serial PRIMARY KEY NOT NULL,
	"month_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	CONSTRAINT "student_tuition_month_student_unique" UNIQUE("month_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "tuition_months" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" date NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "tuition_months_month_unique" UNIQUE("month"),
	CONSTRAINT "tuition_months_first_day" CHECK (extract(day from "tuition_months"."month") = 1),
	CONSTRAINT "tuition_months_amount" CHECK ("tuition_months"."amount" = 60)
);
--> statement-breakpoint
ALTER TABLE "student_tuition" ADD CONSTRAINT "student_tuition_month_id_tuition_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."tuition_months"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tuition" ADD CONSTRAINT "student_tuition_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_tuition_student_idx" ON "student_tuition" USING btree ("student_id");