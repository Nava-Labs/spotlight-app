"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"} className="rounded-full">
                <p className="text-sm">
                  {truncateAddress(publicKey.toBase58(), 4)}
                </p>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disconnect to Spotlight App</DialogTitle>
                <DialogDescription>
                  By ... you are going to disconnect with the Spotlight App
                </DialogDescription>
                <Button onClick={disconnect} variant="destructive">
                  Disconnect
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
