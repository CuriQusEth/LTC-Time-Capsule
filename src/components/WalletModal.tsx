import { useWeb3 } from '../lib/Web3Provider';
import { EIP6963ProviderDetail } from '../types/wallet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: Props) {
  const { discoveredWallets, connectWallet } = useWeb3();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0c] border border-white/10 rounded-lg w-full max-w-md overflow-hidden flex flex-col shadow-[0_0_40px_rgba(196,166,126,0.1)]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-serif italic text-white">Connect Guardian</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          {discoveredWallets.length === 0 ? (
            <div className="text-center py-6 text-white/40">
              <p>No guardians detected.</p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="text-[#c4a67e] hover:text-white mt-2 inline-block text-xs uppercase tracking-widest"
              >
                Install MetaMask
              </a>
            </div>
          ) : (
            discoveredWallets.map((wallet) => (
              <button
                key={wallet.info.uuid}
                onClick={async () => {
                  await connectWallet(wallet);
                  onClose();
                }}
                className="flex items-center gap-4 w-full p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#c4a67e]/30 hover:bg-[#c4a67e]/5 transition-all text-left"
              >
                <img src={wallet.info.icon} alt={wallet.info.name} className="w-8 h-8 rounded" />
                <span className="font-serif text-white text-lg">{wallet.info.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
