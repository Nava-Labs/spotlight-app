import { Database } from "@/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { ACTIONS_CORS_HEADERS, NextAction } from "@solana/actions";

type Influencer = Database["public"]["Tables"]["influencers"]["Row"];

export const POST = async (req: Request) => {
  try {
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
  } catch (e) {
    return Response.json({ msg: "Failed to post!", err: e }, { status: 400 });
  }
};

async function postAction(
  req: Request,
  params: ReturnType<typeof validatedQueryParams>,
  influencer: Influencer,
) {
  const supabaseClient = getSupabaseServerClient();
  const { requestType, username, details, title } = params;
  const { error } = await supabaseClient.from("requests").insert({
    influencer_id: influencer.id,
    status: "requested",
    deal_expiry_date: "2024-12-31",
    details,
    request_type: requestType,
    requested_by: username,
    title,
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
  influencer: Influencer,
) {
  const USER_ID = "1610013173649924098";
  const tweet_id = new URL(params.details).pathname.split("/")[3];

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

  // console.log(USER_ID, tweet_id);
  // const postTweet = await fetch(`https://api.twitter.com/2/tweets`, {
  //   method: "POST",
  //   headers: {
  //     "Content-type": "application/json",
  //     Authorization: `Bearer ${influencer.access_token}`,
  //   },
  //   body: JSON.stringify({ text: "Testing" }),
  // });

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
