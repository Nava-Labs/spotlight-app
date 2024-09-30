create table influencers (
  id bigint primary key generated always as identity,
  name text,
  email text,
  twitter_handle text,
  bio text
);

create table users (
  id bigint primary key generated always as identity,
  name text,
  description text,
  website text,
  twitter_handle text,
  public_key text not null
);

create table collaborations (
  id bigint primary key generated always as identity,
  influencer_id bigint references influencers (id),
  user_id bigint references users (id),
  deal_expiry_date date,
  details text
);
