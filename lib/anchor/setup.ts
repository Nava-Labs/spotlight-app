import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, SpotlightPrograms } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const ESCROW_VAULT = "EscrowVault";
const ESCROW_SOL_VAULT = "EscrowSolVault";

const programId = new PublicKey("CgBcBA5wtFsHaSMwDqpoTwweqVarEb8XUMYiLstNJJXo");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const spotlightProgram = new Program<SpotlightPrograms>(IDL, programId, {
  connection,
});

export const [escrowVault] = PublicKey.findProgramAddressSync(
  [Buffer.from(ESCROW_VAULT)],
  spotlightProgram.programId,
);

export const [escrowSolVault] = PublicKey.findProgramAddressSync(
  [Buffer.from(ESCROW_SOL_VAULT)],
  spotlightProgram.programId,
);
