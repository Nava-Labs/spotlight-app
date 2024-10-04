import { Database } from "@/database.types";

export type Requests = Database["public"]["Tables"]["requests"]["Row"];

export type Influencers = Database["public"]["Tables"]["influencers"]["Row"];

export type User = {
  id: number;
  public_key: string;
};

export type ThreadRequest = Requests & {
  influencer: Pick<Influencers, "twitter_handle"> | null;
};
