import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  escrowSolVault,
  escrowVault,
  spotlightProgram,
} from "@/lib/anchor/setup";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const { userPubkey } = validatedQueryParams(requestUrl);

  const supabaseClient = getSupabaseServerClient();
  const { data: user } = await supabaseClient
    .from("users")
    .select("*, influencers(*)")
    .eq("public_key", userPubkey)
    .single();

  if (user == null) {
    return Response.json(
      {
        err: "Missing public key!",
      },
      {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  }

  const influencer = user.influencers[0];

  const payload: ActionGetResponse = {
    icon: new URL("/Spotlight.jpg", new URL(req.url).origin).toString(),
    label: "Request & Pay 0.001 SOL", // this value will be ignored since `links.actions` exists
    title: influencer.blinks_title,
    description: influencer.blinks_description,
    links: {
      actions: [
        {
          label: `Request & Pay ${influencer.price} SOL`, // button text
          href: `${requestUrl}&title={title}&detals={details}&username={username}`,
          type: "transaction",
          parameters: [
            {
              name: "username",
              label: "Your X handle (i.e @spotlightBlinks)",
              required: true,
            },
            {
              name: "title", // parameter name in the `href` above
              label: "Write your campaign title here...", // placeholder of the text input
              required: true,
            },
            {
              type: "textarea",
              name: "details",
              label: "Write your post content here...",
              required: true,
            },
          ],
        },

        // {
        //   label: "form",
        //   href: "https://www.google.com",
        //   type: "external-link",
        // },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { userPubkey, title, username, details } =
      validatedQueryParams(requestUrl);

    console.log("userPubkey", userPubkey);
    console.log("title", title);
    console.log("details", details);
    console.log("username", username);

    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (e) {
      return Response.json(
        { msg: "Invalid Pubkey params!", err: e },
        { status: 400, headers: ACTIONS_CORS_HEADERS },
      );
    }

    const supabaseClient = getSupabaseServerClient();

    const { data: user } = await supabaseClient
      .from("users")
      .select("*, influencers(*)")
      .eq("public_key", userPubkey)
      .single();

    const influencer = user!.influencers[0];

    const requestIx = await spotlightProgram.methods
      .request(new BN(influencer.price * LAMPORTS_PER_SOL))
      .accounts({ escrowVault, escrowSolVault, user: account })
      .instruction();

    const transaction = new Transaction();
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
      requestIx,
    );

    transaction.feePayer = account;

    const connection = new Connection(clusterApiUrl("devnet"));

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // const { error } = await supabaseClient.from("requests").insert({
    //   influencer_id: influencer.id,
    //   status: "requested",
    //   user_id: user?.id,
    //   deal_expiry_date: "2024-12-31",
    //   details: "",
    //   request_type: "repost",
    // });

    // if (error) {
    //   return Response.json(
    //     { msg: "Failed to write to db!", err: error },
    //     { status: 400, headers: ACTIONS_CORS_HEADERS },
    //   );
    // }

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        type: "transaction",

        links: {
          next: {
            type: "post",
            href: `${requestUrl.origin}/api/insert-request-db?userPubkey=${userPubkey}`,

            //   type: "inline",
            //   action: {
            //     type: "completed",
            //     label: "this is next label",
            //     icon: new URL(
            //       "/Spotlight.jpg",
            //       new URL(req.url).origin,
            //     ).toString(),
            //     title: "completed state",
            //     description: "this is next",
            //   },
            // },
          },
        },
      },
    });

    return Response.json(payload, {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (e) {
    return Response.json(
      { msg: "Failed to post!", err: e },
      { status: 400, headers: ACTIONS_CORS_HEADERS },
    );
  }
};

function validatedQueryParams(requestUrl: URL) {
  let userPubkey: PublicKey = new PublicKey("11111111111111111111111111111111");
  let title: string = "";
  let username: string = "";
  let details: string = "";

  if (requestUrl.searchParams.get("userPubkey")) {
    userPubkey = new PublicKey(requestUrl.searchParams.get("userPubkey")!);
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

  return {
    userPubkey,
    title,
    username,
    details,
  };
}
