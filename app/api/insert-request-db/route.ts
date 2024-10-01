import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { creator } = validatedQueryParams(requestUrl);

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
      details: "",
      request_type: "repost",
    });

    if (error) {
      return Response.json(
        { msg: "Failed to write to db!", err: error },
        { status: 400 },
      );
    }

    return Response.json({
      message: "success",
      status: 200,
    });
  } catch (e) {
    return Response.json({ msg: "Failed to post!", err: e }, { status: 400 });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let creator: string = "";

  if (requestUrl.searchParams.get("creator")) {
    creator = requestUrl.searchParams.get("creator")!;
  } else {
    throw Error("Missing creator");
  }

  return {
    creator,
  };
}
