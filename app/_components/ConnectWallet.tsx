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
        <div className="flex space-x-2 items-center">
          <p className="text-sm">{truncateAddress(publicKey.toBase58(), 4)}</p>
          <Button onClick={disconnect} variant="destructive">
            Disconnect
          </Button>
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
