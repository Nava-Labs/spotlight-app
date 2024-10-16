import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { Influencers } from "@/types";
import {
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  NextAction,
} from "@solana/actions";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const params = validatedQueryParams(requestUrl);

  const supabaseClient = getSupabaseServerClient();

  const { data: influencer } = await supabaseClient
    .from("influencers")
    .select("*")
    .eq("twitter_handle", params.creator)
    .single();

  if (!influencer) {
    return Response.json(
      { message: "Can't find any influencer" },
      {
        status: 404,
      },
    );
  }

  switch (params.requestType) {
    case "post":
      return await postAction(req, params, influencer);
    case "repost":
      return await repostAction(req, params, influencer);

    default:
      break;
  }
  try {
  } catch (e) {
    return Response.json({ msg: "Failed to post!", err: e }, { status: 400 });
  }
};

async function postAction(
  req: Request,
  params: ReturnType<typeof validatedQueryParams>,
  influencer: Influencers,
) {
  const body: ActionPostRequest = await req.json();

  const supabaseClient = getSupabaseServerClient();
  const { requestType, username, details, title } = params;
  const sentimentResult = await analyzeSentiment(details);

  console.log("SENTIMENT RESULT >>>", sentimentResult);
  const { error } = await supabaseClient.from("requests").insert({
    public_key: body.account,
    influencer_id: influencer.id,
    status: "requested",
    deal_expiry_date: "2024-12-31",
    details,
    request_type: requestType,
    requested_by: username,
    title,
    sentiment: sentimentResult.sentiment,
    scam_probability: sentimentResult.scamProbability,
    sentiment_explanation: sentimentResult.explanation
  });

  if (error) {
    return Response.json(
      { msg: "Failed to write to db!", err: error },
      { status: 400 },
    );
  }

  const payload: NextAction = {
    type: "completed",
    icon: new URL("/Spotlight.jpg", new URL(req.url).origin).toString(),
    title: "Request Completed!",
    description: "Request submitted. Wait for approval from blinks owner!",
    label: "Requested!",
  };

  return Response.json(payload, {
    status: 200,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": "2.1.3",
      "X-Blockchain-Ids": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    },
  });
}

async function repostAction(
  req: Request,
  params: ReturnType<typeof validatedQueryParams>,
  influencer: Influencers,
) {
  const tweet_id = new URL(params.details).pathname.split("/")[3];

  const postTweet = await fetch(
    `https://api.twitter.com/2/users/${influencer.twitter_id}/retweets`,
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
  console.log("RES >>>", res);

  const payload: NextAction = {
    type: "completed",
    icon: new URL("/Spotlight.jpg", new URL(req.url).origin).toString(),
    title: "Reposted!",
    description: `Your tweet of ${params.details} has been reposted by ${params.creator}. You can visit their profile to check the post.`,
    label: "Reposted!",
  };

  return Response.json(payload, {
    status: 200,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "X-Action-Version": "2.1.3",
      "X-Blockchain-Ids": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    },
  });
}

async function analyzeSentiment(text: string) {
  const prompt = `
    Analyze the following text for sentiment and potential scam indicators:
    "${text}"
    
    Provide a response in the following JSON format:
    {
      "sentiment": "positive/neutral/negative",
      "scamProbability": 0-100,
      "explanation": "Brief explanation of the analysis"
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

function validatedQueryParams(requestUrl: URL) {
  let creator: string = "";
  let title: string = "";
  let username: string = "";
  let details: string = "";
  let requestType: string = "";

  if (requestUrl.searchParams.get("creator")) {
    creator = requestUrl.searchParams.get("creator")!;
  }

  if (requestUrl.searchParams.get("title")) {
    title = requestUrl.searchParams.get("title")!;
  }

  if (requestUrl.searchParams.get("username")) {
    username = requestUrl.searchParams.get("username")!;
  }

  if (requestUrl.searchParams.get("details")) {
    details = requestUrl.searchParams.get("details")!;
  }

  if (requestUrl.searchParams.get("requestType")) {
    requestType = requestUrl.searchParams.get("requestType")!;
  }

  return {
    creator,
    title,
    username,
    details,
    requestType,
  };
}
