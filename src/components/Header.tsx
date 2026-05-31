import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../lib/Web3Provider';
import { WalletModal } from './WalletModal';
import { Lock, Menu, X } from 'lucide-react';

export function Header() {
  const { account, balance, isConnected, isCorrectNetwork, switchToLitVMNetwork } = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const NavLinks = () => (
    <>
      <Link to="/" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">Home</Link>
      <Link to="/create" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">Create</Link>
      <Link to="/explore" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">Explore</Link>
      {isConnected && (
        <Link to="/my-capsules" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">My Capsules</Link>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c4a67e] to-[#8e724a] shadow-[0_0_15px_rgba(196,166,126,0.3)] transition-all group-hover:scale-105"></div>
              <span className="font-serif text-xl italic tracking-wider text-[#c4a67e]">LTC TimeCapsule</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <NavLinks />
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {!isConnected ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#c4a67e] text-[#080809] font-bold uppercase tracking-widest rounded text-[11px] px-8 py-3 transition-all hover:bg-[#b0946b]"
                >
                  Connect Wallet
                </button>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={switchToLitVMNetwork}
                  className="border border-[#c4a67e]/30 text-[#c4a67e] font-bold uppercase tracking-widest rounded text-[11px] px-8 py-3 transition-all hover:bg-white/5"
                >
                  Switch Network
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-[11px] tracking-widest font-bold text-[#c4a67e]">
                    {balance ? parseFloat(balance).toFixed(4) : '0'} LTC
                  </span>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] tracking-widest font-mono text-slate-300">{formatAddr(account!)}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/50 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#0a0a0c] pt-20 px-4">
          <nav className="flex flex-col gap-6">
            <NavLinks />
            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              {!isConnected ? (
                <button
                  onClick={() => { setModalOpen(true); setMobileMenuOpen(false); }}
                  className="bg-[#c4a67e] text-[#080809] font-bold uppercase tracking-widest rounded text-[11px] px-8 py-4 transition-all"
                >
                  Connect Wallet
                </button>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={() => { switchToLitVMNetwork(); setMobileMenuOpen(false); }}
                  className="border border-[#c4a67e]/30 text-[#c4a67e] font-bold uppercase tracking-widest rounded text-[11px] px-8 py-4 transition-all hover:bg-white/5"
                >
                  Switch Network
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-[#c4a67e] font-mono">Connected: {account}</span>
                  <span className="text-xs uppercase tracking-widest text-[#c4a67e]">{balance ? parseFloat(balance).toFixed(4) : '0'} LTC</span>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
