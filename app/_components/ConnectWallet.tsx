"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

export default function WalletConnect() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    setVisible(true);
  };

  return (
    <>
      {publicKey ? (
        <div className="space-y-2">
          <Button onClick={disconnect} variant="destructive">
            Disconnect
          </Button>
          <p className="text-sm flex justify-end">
            {truncateAddress(publicKey.toBase58(), 4)}
          </p>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          variant={"outline"}
          className="rounded-full"
        >
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </>
  );
}
