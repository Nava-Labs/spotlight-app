import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import {
  escrowSolVault,
  escrowVault,
  spotlightProgram,
} from "@/lib/anchor/setup";
import { useCallback, useTransition } from "react";

export function useSpotlightRequest() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [isRequesting, startRequest] = useTransition();

  const request = useCallback(async (amount: number) => {
    startRequest(async () => {
      if (!publicKey) return;
      try {
        const tx = await spotlightProgram.methods
          .request(new BN(amount * LAMPORTS_PER_SOL))
          .accounts({ escrowVault, escrowSolVault, user: publicKey })
          .transaction();

        const signature = await sendTransaction(tx, connection);
        console.log("Request transaction signature:", signature);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }, []);

  return {
    request: request,
    isLoading: isRequesting,
  };
}
