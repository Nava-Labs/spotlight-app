import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  createSpotlightProgramsProgram,
  request,
} from "./clients/js/src/generated";
import { generateSigner, transactionBuilder } from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";

export function useRequest() {
  const wallet = useWallet();
  wallet.connect();
  const requestt = async (amount: number) => {
    // Setup umi
    const umi = createUmi("https://api.devnet.solana.com");
    umi.use(walletAdapterIdentity(wallet));
    const spotlightProgram = createSpotlightProgramsProgram();

    umi.programs.add(spotlightProgram);
    const myProgram = umi.programs.get("spotlightPrograms");
    console.log(myProgram);
    try {
      const escrowVault = umi.eddsa.findPda(
        umi.programs.get("spotlightPrograms").publicKey,
        [Buffer.from("EscrowVault")],
      );
      const escrowSolVault = umi.eddsa.findPda(
        umi.programs.get("spotlightPrograms").publicKey,
        [Buffer.from("EscrowSolVault")],
      );

      const signerAuthority = generateSigner(umi);

      const tx = transactionBuilder().add(
        request(umi, {
          escrowVault,
          escrowSolVault,
          user: wallet.publicKey!,
          solAmount: amount,
        }),
      );

      // console.log(tx.getSigners(umi));
      // const result = await tx.sendAndConfirm(umi);
      //
      const signedTx = await tx.buildAndSign(umi);
      console.log(signedTx);
      // const signature = await umi.rpc.sendTransaction(signedTx);
      // // const serializedTx = base58.serialize(builtTx.serialize());
      // console.log(signature);
      // const result = await tx.sendAndConfirm(umi);
      const signature = await umi.rpc.sendTransaction(signedTx);
      const result = await umi.rpc.confirmTransaction(signature, {
        strategy: {
          type: "blockhash",
          ...(await umi.rpc.getLatestBlockhash()),
        },
      });

      console.log("Request transaction signature:", result);
      return result;
    } catch (error) {
      console.error("Error requesting SOL:", error);
      throw error;
    }
  };
  return { requestt };
}
