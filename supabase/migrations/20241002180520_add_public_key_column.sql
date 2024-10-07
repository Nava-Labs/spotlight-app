alter table "public"."influencers" add column "public_key" text not null;

alter table "public"."requests" add column "public_key" text not null;

alter table "public"."requests" add column "sentiment" text;
alter table "public"."requests" add column "scam_probability" integer;
alter table "public"."requests" add column "sentiment_explanation" text;

