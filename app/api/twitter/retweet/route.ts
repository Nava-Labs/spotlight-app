import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

const USER_ID = "1610013173649924098";

export async function POST(request: NextRequest) {
  const { link, creator } = await request.json();
  const supabaseClient = getSupabaseServerClient();
  const tweet_id = new URL(link).pathname.split("/")[3];

  console.log("tweet_id", tweet_id);
  console.log("creator", creator);

  try {
    const { data: influencer } = await supabaseClient
      .from("influencers")
      .select(`*`)
      .eq("twitter_handle", creator)
      .single();

    if (!influencer) throw Error("No influencer found");

    const postTweet = await fetch(
      `https://api.twitter.com/2/users/${USER_ID}/retweets`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${influencer.access_token}`,
        },
        body: JSON.stringify({ tweet_id: tweet_id }),
      },
    );

    const res = await postTweet.json();

    return NextResponse.json({ ok: true, response: res }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
}
