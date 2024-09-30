alter table "public"."requests" drop constraint "collaborations_status_check";

alter table "public"."requests" add constraint "requests_status_check" CHECK ((status = ANY (ARRAY['requested'::text, 'completed'::text, 'approved'::text, 'declined'::text]))) not valid;

alter table "public"."requests" validate constraint "requests_status_check";


