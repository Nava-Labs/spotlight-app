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
  const payload: ActionGetResponse = {
    icon: new URL("/megumi.jpg", new URL(req.url).origin).toString(),
    label: "Request & Pay 0.001 SOL",
    title: "Request for Repost",
    description:
      "Paste the post URL you'd like for me to repost and click on request, then wait for approval.",
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
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
