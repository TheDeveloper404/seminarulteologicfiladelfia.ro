-- Fail on existing duplicates, including contradictory attendance marks; never discard records.
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_session_unique" UNIQUE("student_id","session_date");
