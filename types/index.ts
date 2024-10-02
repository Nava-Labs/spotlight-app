export type Requests = {
  id: number;
  influencer_id: number;
  status: string;
  user_id: number;
  deal_expiry_date: string;
  details: string;
  request_type: string;
};

export type Influencers = {
  id: number;
  twitter_handle: string;
  social_score: number;
  blinks_title: string;
  blinks_description: string;
  user_id: number;
  access_token: string;
};

export type User = {
  id: number;
  public_key: string;
};

export type ThreadRequest = {
  id: number;
  status: string;
  request_type: string;
  requested_by: string;
  title: string;
  details?: string | null;
  deal_expiry_date?: string | null;
  influencer_id?: number | null;
};
