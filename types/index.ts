import { Database } from "@/database.types";

export type Requests = Database["public"]["Tables"]["requests"]["Row"];

export type Influencers = Database["public"]["Tables"]["influencers"]["Row"];

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
  influencer: Pick<Influencers, "twitter_handle"> | null;
};
