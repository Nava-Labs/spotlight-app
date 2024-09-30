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
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";

export const GET = (req: Request) => {
  const baseHref = new URL(
    `/api/post-request`,
    new URL(req.url).origin,
  ).toString();

  const payload: ActionGetResponse = {
    icon: new URL("/megumi.jpg", new URL(req.url).origin).toString(),
    label: "Request & Pay 0.001 SOL", // this value will be ignored since `links.actions` exists
    title: "Request for Repost",
    description:
      "Paste the post URL you'd like for me to repost and click on request, then wait for approval.",
    links: {
      actions: [
        {
          label: "Request & Pay 0.001 SOL", // button text
          href: `${baseHref}?addurl={typefully}`,
          // href: `${baseHref}`,
          type: "transaction",
          parameters: [
            {
              name: "typefully", // parameter name in the `href` above
              label: "Enter the typefully form", // placeholder of the text input
              required: true,
            },
          ],
        },
        // {
        //   label: "form",
        //   href: "https://google.com",
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
    // const requestUrl = new URL(req.url);
    // const { additionalUrl } = validatedQueryParams(requestUrl);
    // console.log("additionalUrl", additionalUrl);

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

    const requestIx = await spotlightProgram.methods
      .request(new BN(1000000)) // 0.001 SOL
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

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        type: "transaction",
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
  let addurl: string = "";

  if (requestUrl.searchParams.get("addurl")) {
    addurl = requestUrl.searchParams.get("addurl")!;
  }

  return {
    addurl,
  };
}
