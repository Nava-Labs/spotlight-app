import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { TWITTER_CALLBACK_URL } from "@/lib/constants";

const BasicAuthToken = Buffer.from(
  `${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!}:${process.env.TWITTER_CLIENT_SECRET!}`,
  "utf8",
).toString("base64");

const twitterOauthTokenParams = {
  client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
  code_verifier: "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA",
  redirect_uri: TWITTER_CALLBACK_URL,
  grant_type: "authorization_code",
};

async function fetchUserToken(code: string) {
  try {
    const formatData = new URLSearchParams({
      ...twitterOauthTokenParams,
      code,
    });
    const getTokenRequest = await fetch(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        body: formatData.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${BasicAuthToken}`,
        },
      },
    );
    const getTokenResponse = await getTokenRequest.json();
    return getTokenResponse;
  } catch (err) {
    console.log(err);
    return null;
  }
}

type UserData = {
  data: {
    id: string;
    name: string;
    username: string;
  };
};

async function fetchUserData(accessToken: string) {
  try {
    const getUserRequest = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const getUserProfile = await getUserRequest.json();
    return getUserProfile as UserData;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function calculateSocialScore(accessToken: string, userId: string) {
  // Fetch user data
  const userResponse = await fetch(
    `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const userData = await userResponse.json();
  console.log("USER DATA >>>>>", userData);

  // Fetch recent tweets
  const tweetsResponse = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=public_metrics&exclude=retweets`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const recentTweets = await tweetsResponse.json();
  console.log("RECENT TWEETS >>>>>", recentTweets);

  // Calculate score
  const { followers_count, following_count } = userData.data.public_metrics;
  const followerRatio = followers_count / (following_count || 1);

  // Apply logarithmic scaling to follower ratio
  const scaledFollowerRatio = Math.log10(followerRatio + 1);

  let totalEngagements = 0;
  let tweetCount = 0;

  for (const tweet of recentTweets.data) {
    const { retweet_count, reply_count, like_count } = tweet.public_metrics;
    // Apply weights to each metric
    totalEngagements += reply_count * 4 + retweet_count * 3 + like_count * 2;
    tweetCount++;
  }

  const averageEngagementPerTweet = totalEngagements / (tweetCount || 1);
  const engagementRate = averageEngagementPerTweet / (followers_count || 1);

  console.log("SCALED FOLLOWER RATIO >>>>>", scaledFollowerRatio);
  console.log("ENGAGEMENT RATE >>>>>", {
    engagementRate,
    averageEngagementPerTweet,
    totalEngagements,
    tweetCount,
    followers_count,
  });

  // Calculate score (0-100)
  const score = Math.min(
    100,
    Math.round((scaledFollowerRatio * 50 + engagementRate * 50) * 100) / 100,
  );

  return score;
}

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const supabase = getSupabaseServerClient();

  const tokenResponse = await fetchUserToken(code);
  const accessToken = tokenResponse.access_token;

  if (accessToken) {
    const userDataResponse = await fetchUserData(accessToken);
    const userCredentials = { ...tokenResponse, ...userDataResponse?.data };

    console.log("USER CREDENTIALS >>>>>", { accessToken, userDataResponse });
    // Calculate social score
    const socialScore = await calculateSocialScore(
      accessToken,
      userDataResponse?.data.id ?? "",
    );
    console.log("SOCIAL SCORE >>>>>", { socialScore });

    const { data, error } = await supabase
      .from("influencers")
      .insert({
        public_key: "",
        twitter_id: userDataResponse?.data.id,
        twitter_handle: userDataResponse?.data.username,
        price: 0,
        access_token: userCredentials.access_token,
        social_score: Number(socialScore.toFixed(0)), // Add this line
      })
      .select()
      .single();

    console.log("INFLUENCERS DATA >>>>>", { data });
    if (!error) {
      return NextResponse.json(
        { ...userCredentials, socialScore },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Error inserting influencer data" },
        { status: 400 },
      );
    }
  }

  try {
    return NextResponse.json(
      { error: "No access token received" },
      { status: 400 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
}
