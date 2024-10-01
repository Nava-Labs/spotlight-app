import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { ACTIONS_CORS_HEADERS, NextAction } from "@solana/actions";

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { creator, title, username, details, requestType } =
      validatedQueryParams(requestUrl);

    const supabaseClient = getSupabaseServerClient();

    const { data: influencer } = await supabaseClient
      .from("influencers")
      .select("*")
      .eq("twitter_handle", creator)
      .single();

    if (!influencer) {
      return Response.json(
        { message: "Can't find any influencer" },
        {
          status: 404,
        },
      );
    }

    const { error } = await supabaseClient.from("requests").insert({
      influencer_id: influencer.id,
      status: "requested",
      deal_expiry_date: "2024-12-31",
      details,
      request_type: requestType == 0 ? "post" : "repost",
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
      title: "Request Completed",
      description: "Request completed!",
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
  } catch (e) {
    return Response.json({ msg: "Failed to post!", err: e }, { status: 400 });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let creator: string = "";
  let title: string = "";
  let username: string = "";
  let details: string = "";
  let requestType: number = 0; // 0 -> Post, 1 -> Repost

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
    requestType = Number(requestUrl.searchParams.get("requestType"))!;
  }

  return {
    creator,
    title,
    username,
    details,
    requestType,
  };
}
