import { NextRequest, NextResponse } from "next/server";
import { TWITTER_CALLBACK_URL } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

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

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const supabase = getSupabaseServerClient();
  try {
    const tokenResponse = await fetchUserToken(code);
    const accessToken = tokenResponse.access_token;

    console.log("code >>>>", code);
    if (accessToken) {
      const userDataResponse = await fetchUserData(accessToken);
      const userCredentials = { ...tokenResponse, ...userDataResponse?.data };

      const { error } = await supabase.from("influencers").insert({
        public_key: "",
        twitter_id: userDataResponse?.data.id,
        twitter_handle: userDataResponse?.data.username,
        price: 0,
        access_token: userCredentials.access_token,
      });

      if (!error) {
        return NextResponse.json(userCredentials, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "No access token received" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 400 });
  }
}
