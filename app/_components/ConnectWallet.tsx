"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";

export default function WalletConnect() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    setVisible(true);
  };

  return (
    <>
      {publicKey ? (
        <div className="space-y-4">
          <p className="text-sm">Connected: {publicKey.toBase58()}</p>
          <Button onClick={disconnect} variant="destructive">
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect}>Connect Wallet</Button>
      )}
    </>
  );
}
