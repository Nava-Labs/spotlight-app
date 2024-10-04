import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import {
  escrowSolVault,
  escrowVault,
  spotlightProgram,
} from "@/lib/anchor/setup";
import { useCallback, useTransition } from "react";
import invariant from "tiny-invariant";
import bs58 from "bs58";
import useSupabaseBrowser from "@/hooks/useSupabaseBrowser";
import { RequestStatus } from "@/types";

// FIX: This need to be done in the server. Not client!
export function useSpotlightClaim({
  statusOnSuccess,
}: {
  statusOnSuccess: RequestStatus;
}) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const client = useSupabaseBrowser();
  const [isClaiming, startClaim] = useTransition();

  const SIGNER_AUTHORITY_PK = process.env.NEXT_PUBLIC_SIGNER_AUTHORITY_PK;
  invariant(SIGNER_AUTHORITY_PK, "SIGNER_AUTHORITY_PK is not defined");

  // signer authority key / server signer
  const signerAuthority = bs58.decode(SIGNER_AUTHORITY_PK);
  const keypairSignerAuthority = Keypair.fromSecretKey(signerAuthority);

  const claim = useCallback(
    async (amount: number, requestId: number, refetchRequests: () => void) => {
      startClaim(async () => {
        if (!publicKey) return;
        try {
          const tx = await spotlightProgram.methods
            .claim(new BN(amount * LAMPORTS_PER_SOL))
            .accounts({
              escrowVault,
              escrowSolVault,
              user: publicKey,
              signerAuthority: keypairSignerAuthority.publicKey,
            })
            .signers([keypairSignerAuthority])
            .transaction();

          const latestBlockhash = await connection.getLatestBlockhash();
          tx.recentBlockhash = latestBlockhash.blockhash;
          tx.feePayer = publicKey;

          // Sign the transaction with the signer authority
          tx.partialSign(keypairSignerAuthority);

          const signature = await sendTransaction(tx, connection);
          console.log(
            `Claim transaction signature for ${requestId}:`,
            signature,
          );

          if (signature) {
            const { error } = await client
              .from("requests")
              .update({ status: statusOnSuccess, tx_receipt: signature })
              .eq("id", requestId);

            if (error) {
              console.error("Error updating request:", error);
            } else {
              refetchRequests();
            }
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });
    },
    [publicKey, keypairSignerAuthority, sendTransaction, connection],
  );

  return {
    claim: claim,
    isLoading: isClaiming,
  };
}
