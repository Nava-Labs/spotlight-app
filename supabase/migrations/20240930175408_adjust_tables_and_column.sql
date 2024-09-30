create table "public"."influencers" (
    "id" bigint generated always as identity not null,
    "twitter_handle" text,
    "social_score" bigint not null default '0'::bigint,
    "blinks_title" text not null default ''::text,
    "blinks_description" text not null default ''::text,
    "user_id" bigint not null,
    "price" numeric not null
);


create table "public"."requests" (
    "id" bigint generated always as identity not null,
    "influencer_id" bigint,
    "status" text not null,
    "user_id" bigint,
    "deal_expiry_date" date,
    "details" text,
    "request_type" text not null default ''::text
);


create table "public"."users" (
    "id" bigint generated always as identity not null,
    "public_key" text not null
);


CREATE UNIQUE INDEX collaborations_pkey ON public.requests USING btree (id);

CREATE UNIQUE INDEX influencers_pkey ON public.influencers USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."influencers" add constraint "influencers_pkey" PRIMARY KEY using index "influencers_pkey";

alter table "public"."requests" add constraint "collaborations_pkey" PRIMARY KEY using index "collaborations_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."influencers" add constraint "influencers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."influencers" validate constraint "influencers_user_id_fkey";

alter table "public"."requests" add constraint "collaborations_influencer_id_fkey" FOREIGN KEY (influencer_id) REFERENCES influencers(id) not valid;

alter table "public"."requests" validate constraint "collaborations_influencer_id_fkey";

alter table "public"."requests" add constraint "collaborations_status_check" CHECK ((status = ANY (ARRAY['requested'::text, 'pending'::text, 'approved'::text]))) not valid;

alter table "public"."requests" validate constraint "collaborations_status_check";

alter table "public"."requests" add constraint "collaborations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."requests" validate constraint "collaborations_user_id_fkey";

grant delete on table "public"."influencers" to "anon";

grant insert on table "public"."influencers" to "anon";

grant references on table "public"."influencers" to "anon";

grant select on table "public"."influencers" to "anon";

grant trigger on table "public"."influencers" to "anon";

grant truncate on table "public"."influencers" to "anon";

grant update on table "public"."influencers" to "anon";

grant delete on table "public"."influencers" to "authenticated";

grant insert on table "public"."influencers" to "authenticated";

grant references on table "public"."influencers" to "authenticated";

grant select on table "public"."influencers" to "authenticated";

grant trigger on table "public"."influencers" to "authenticated";

grant truncate on table "public"."influencers" to "authenticated";

grant update on table "public"."influencers" to "authenticated";

grant delete on table "public"."influencers" to "service_role";

grant insert on table "public"."influencers" to "service_role";

grant references on table "public"."influencers" to "service_role";

grant select on table "public"."influencers" to "service_role";

grant trigger on table "public"."influencers" to "service_role";

grant truncate on table "public"."influencers" to "service_role";

grant update on table "public"."influencers" to "service_role";

grant delete on table "public"."requests" to "anon";

grant insert on table "public"."requests" to "anon";

grant references on table "public"."requests" to "anon";

grant select on table "public"."requests" to "anon";

grant trigger on table "public"."requests" to "anon";

grant truncate on table "public"."requests" to "anon";

grant update on table "public"."requests" to "anon";

grant delete on table "public"."requests" to "authenticated";

grant insert on table "public"."requests" to "authenticated";

grant references on table "public"."requests" to "authenticated";

grant select on table "public"."requests" to "authenticated";

grant trigger on table "public"."requests" to "authenticated";

grant truncate on table "public"."requests" to "authenticated";

grant update on table "public"."requests" to "authenticated";

grant delete on table "public"."requests" to "service_role";

grant insert on table "public"."requests" to "service_role";

grant references on table "public"."requests" to "service_role";

grant select on table "public"."requests" to "service_role";

grant trigger on table "public"."requests" to "service_role";

grant truncate on table "public"."requests" to "service_role";

grant update on table "public"."requests" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


