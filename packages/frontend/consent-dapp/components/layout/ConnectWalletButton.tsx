import { ConnectKitButton } from "connectkit";

interface ConnectWalletButtonProps {
    label?: string
}

export default function ConnectWalletButton({label}: ConnectWalletButtonProps) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <div
            onClick={show}
            className={`
                  relative group cursor-pointer select-none
                  flex items-center gap-2
                  px-4 py-2 rounded-xl
                  text-sm
                  transition-all duration-200 ease-out
                  
                  ${
                    isConnected
                      ? "bg-primary text-white border border-primary/30 hover:border-primary/60 hover:bg-primary/80 shadow-[0_0_12px_rgba(52,211,153,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] font-bold"
                      : "bg-primary text-white hover:bg-primary/80 shadow-sm hover:shadow-md"
                  }
                `}
          >
            {/* Dot di stato */}
            {isConnected && (
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            )}

            {/* Label */}
            <span className="w-full">
              {isConnected
                ? (ensName ??
                  truncatedAddress?.slice(0, 4) +
                    "…" +
                    truncatedAddress?.slice(-2))
                : label ? label : "Connect Wallet"}
            </span>
          </div>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
