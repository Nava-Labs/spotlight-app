alter table "public"."influencers" add column "twitter_id" text;

alter table "public"."influencers" drop column "price";
alter table "public"."influencers" add column "price" jsonb;

alter table "public"."requests" drop constraint "requests_status_check";

alter table "public"."requests" add constraint "requests_status_check" CHECK ((status = ANY (ARRAY['requested'::text, 'pending'::text, 'approved'::text, 'declined'::text]))) not valid;

alter table "public"."requests" validate constraint "requests_status_check";

alter table "public"."requests" add column "tx_receipt" text;
alter table "public"."requests" add column "tweet_link" text;

