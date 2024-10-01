import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { PublicKey } from "@solana/web3.js";

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { userPubkey } = validatedQueryParams(requestUrl);

    const supabaseClient = getSupabaseServerClient();

    const { data: user } = await supabaseClient
      .from("users")
      .select("*, influencers(*)")
      .eq("public_key", userPubkey)
      .single();

    const influencer = user!.influencers[0];

    const { error } = await supabaseClient.from("requests").insert({
      influencer_id: influencer.id,
      status: "requested",
      user_id: user?.id,
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
  let userPubkey: PublicKey = new PublicKey("11111111111111111111111111111111");

  if (requestUrl.searchParams.get("userPubkey")) {
    userPubkey = new PublicKey(requestUrl.searchParams.get("userPubkey")!);
  } else {
    throw Error("Missing userPubkey");
  }

  return {
    userPubkey,
  };
}
