alter table "public"."requests" drop constraint "requests_status_check";

alter table "public"."requests" add constraint "requests_status_check" CHECK ((status = ANY (ARRAY['requested'::text, 'approved'::text, 'pending'::text]))) not valid;

alter table "public"."requests" validate constraint "requests_status_check";


