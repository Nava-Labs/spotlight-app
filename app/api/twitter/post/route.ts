import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { creator, text } = await request.json();
  const supabase = getSupabaseServerClient();

  const { data: influencer } = await supabase
    .from("influencers")
    .select("*")
    .eq("twitter_handle", creator)
    .single();

  if (!influencer) {
    return NextResponse.json({ error: "No influencer found" }, { status: 400 });
  }

  const postTweet = await fetch(`https://api.twitter.com/2/tweets`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${influencer.access_token}`,
    },
    body: JSON.stringify({ text: text }),
  });

  console.log(postTweet);
  console.log("RES POSTWEET >>>>", await postTweet.json());
  if (!postTweet.ok) {
    return NextResponse.json(
      { error: postTweet.statusText },
      { status: postTweet.status },
    );
  }

  const res = await postTweet.json();
  console.log("RES POSTWEET >>>>", await postTweet.json());

  try {
    return NextResponse.json({ ok: true, res }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
}
