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
  twitter_handle: string;
  social_score: number;
  blinks_title: string;
  blinks_description: string;
  user_id: number;
};

export type User = {
  id: number;
  public_key: string;
};

export type ThreadRequest = {
  id: number;
  status: string;
  request_type: string;
  users: User;
  details: string;
};
