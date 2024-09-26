import WalletConnect from "./ConnectWallet";

export default function Navbar() {
  return (
    <nav className="bg-background shadow-sm p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
