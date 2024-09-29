// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
//
// import {
//   transactionBuilder,
//   generateSigner,
//   publicKey as umiPublicKey,
// } from "@metaplex-foundation/umi";
// import {
//   createSpotlightProgramsProgram,
//   request,
// } from "@/app/clients/js/src/generated";
//
// export const requestPost = async (req: Request) => {
//   try {
//     const { amount, userPublicKey } = await req.json();
//
//     // Setup umi
//     const umi = createUmi("https://api.devnet.solana.com");
//
//     // Add the spotlight program
//     const spotlightProgram = createSpotlightProgramsProgram();
//     umi.programs.add(spotlightProgram, false);
//
//     // Find PDAs
//     const escrowVault = umi.eddsa.findPda(
//       umi.programs.get("spotlight_programs").publicKey,
//       [Buffer.from("EscrowVault")],
//     );
//     const escrowSolVault = umi.eddsa.findPda(
//       umi.programs.get("spotlight_programs").publicKey,
//       [Buffer.from("EscrowSolVault")],
//     );
//
//     // Create a dummy signer for the user
//     // In a real scenario, this would be the actual user's public key
//     const userSigner = generateSigner(umi);
//     userSigner.publicKey = umiPublicKey(userPublicKey);
//
//     // Build the transaction
//     const tx = transactionBuilder().add(
//       request(umi, {
//         escrowVault,
//         escrowSolVault,
//         user: userSigner,
//         solAmount: amount,
//       }),
//     );
//
//     // Build and serialize the transaction
//     const signedTx = await tx.buildAndSign(umi);
//     const signature = await umi.rpc.sendTransaction(signedTx);
//     // const serializedTx = base58.serialize(builtTx.serialize());
//     //
//     const confirmResult = await tx.sendAndConfirm(umi);
//     console.log("qq", confirmResult);
//     // Return the serialized transaction
//     // return Response.json(
//     //   {
//     //     // transaction: serializedTx,
//     //     message:
//     //       "Transaction built successfully. Sign and send this transaction from the client side.",
//     //   },
//     //   { status: 200 },
//     // );
//     //
//     const transaction = await umi.rpc.getTransaction(signature);
//     console.log("txx", transaction);
//   } catch (error) {
//     console.error("Error building request transaction:", error);
//     return Response.json(
//       { error: "Failed to build transaction" },
//       { status: 500 },
//     );
//   }
// };

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  transactionBuilder,
  generateSigner,
  publicKey as umiPublicKey,
} from "@metaplex-foundation/umi";
import {
  createSpotlightProgramsProgram,
  request,
} from "@/app/clients/js/src/generated";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  // return {};
  try {
    const { amount, userPublicKey } = await req.json();

    // Setup umi
    const umi = createUmi("https://api.devnet.solana.com");

    // Add the spotlight program
    const spotlightProgram = createSpotlightProgramsProgram();
    umi.programs.add(spotlightProgram, false);

    // Find PDAs
    const escrowVault = umi.eddsa.findPda(
      umi.programs.get("spotlight_programs").publicKey,
      [Buffer.from("EscrowVault")],
    );
    const escrowSolVault = umi.eddsa.findPda(
      umi.programs.get("spotlight_programs").publicKey,
      [Buffer.from("EscrowSolVault")],
    );

    // Create a dummy signer for the user
    // In a real scenario, this would be the actual user's public key
    const userSigner = generateSigner(umi);
    userSigner.publicKey = umiPublicKey(userPublicKey);

    // Build the transaction
    const tx = transactionBuilder().add(
      request(umi, {
        escrowVault,
        escrowSolVault,
        user: userSigner,
        solAmount: amount,
      }),
    );

    // Build and serialize the transaction
    const signedTx = await tx.buildAndSign(umi);
    const signature = await umi.rpc.sendTransaction(signedTx);
    // const serializedTx = base58.serialize(builtTx.serialize());
    //
    const confirmResult = await tx.sendAndConfirm(umi);
    console.log("qq", confirmResult);
    // Return the serialized transaction
    // return Response.json(
    //   {
    //     // transaction: serializedTx,
    //     message:
    //       "Transaction built successfully. Sign and send this transaction from the client side.",
    //   },
    //   { status: 200 },
    // );
    //
    const transaction = await umi.rpc.getTransaction(signature);
    console.log("txx", transaction);
  } catch (error) {
    console.error("Error building request transaction:", error);

    return NextResponse.json({ success: true }, { status: 200 });
  }
};
