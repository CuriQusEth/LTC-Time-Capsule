import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../lib/Web3Provider';
import { CapsuleData, formatDate } from '../types/utils';
import { withRetry } from '../lib/rpcRetry';
import { CountdownTimer } from '../components/CountdownTimer';
import { Lock, Unlock, Copy, ExternalLink, Share2 } from 'lucide-react';

export function CapsuleDetails() {
  const { id } = useParams<{ id: string }>();
  const { contract, account, isConnected } = useWeb3();
  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [canUnlockValue, setCanUnlockValue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle'|'pending'|'completed'>('idle');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await withRetry(() => contract.getCapsule(id!)) as CapsuleData;
        if (!data || !data.exists) {
          setNotFound(true);
          return;
        }
        setCapsule(data);
        const unlockable = await withRetry(() => contract.canUnlock(id!));
        setCanUnlockValue(unlockable);
        setLoading(false);
      } catch (e) {
        setNotFound(true);
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, contract, txStatus]);

  const handleUnlock = async () => {
    if (!capsule || !isConnected) return;
    try {
      setTxStatus('pending');
      const tx = await withRetry(() => contract.unlockCapsule(capsule.id));
      setTxHash(tx.hash);
      await tx.wait();
      setTxStatus('completed');
    } catch (e: any) {
      console.error(e);
      setTxStatus('idle');
      alert(`Unlock failed: ${e.message}`);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('URL copied to clipboard');
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (notFound || !capsule) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center text-white/50">
        <h1 className="text-2xl font-serif italic text-white mb-2">Capsule Not Found</h1>
        <p>This capsule does not exist or has been destroyed.</p>
      </main>
    );
  }

  const isCreator = account?.toLowerCase() === capsule.creator.toLowerCase();
  const locked = !capsule.isUnlocked;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <div className="bg-[#0a0a0c] border border-white/5 rounded p-6 md:p-10 relative overflow-hidden">
        {/* Ambient background blur */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 pointer-events-none ${locked ? 'bg-[#c4a67e]' : 'bg-green-500'}`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded text-[10px] font-bold uppercase tracking-widest ${
              locked ? 'bg-[#c4a67e]/10 text-[#c4a67e] border-[#c4a67e]/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
            }`}>
              {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {locked ? (canUnlockValue ? 'Ready to Unlock' : 'Cryptographically Locked') : 'Revealed to Public'}
            </div>
            <button onClick={copyUrl} className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif italic mb-4 break-words text-white">{capsule.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-[10px]">
            <div className="bg-white/5 border border-white/5 rounded p-4 flex flex-col gap-1">
              <span className="text-white/40 uppercase tracking-[0.2em] font-bold">Creator</span>
              <span className="font-mono text-white/80 break-all flex items-center gap-2 tracking-widest mt-1">
                {capsule.creator}
                <button onClick={() => navigator.clipboard.writeText(capsule.creator)} className="hover:text-white"><Copy className="w-3 h-3" /></button>
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded p-4 flex flex-col justify-between">
              <div>
                <span className="text-white/40 uppercase tracking-[0.2em] font-bold block mb-2">Timeline</span>
                <div className="flex justify-between text-white/60 tracking-widest uppercase">
                  <span>Created:</span>
                  <span>{formatDate(capsule.creationDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            {locked ? (
              <div className="bg-white/5 border border-[#c4a67e]/20 rounded p-6 md:p-8 text-center max-w-2xl mx-auto">
                <Lock className="w-12 h-12 text-[#c4a67e]/50 mx-auto mb-4" />
                <h3 className="text-xl font-serif italic text-[#c4a67e] mb-2">Content remains sealed</h3>
                <p className="text-white/40 mb-6 text-[11px] uppercase tracking-widest">The content is cryptographically protected and cannot be accessed by anyone until the target date.</p>
                <div className="max-w-md mx-auto">
                  <CountdownTimer targetDate={Number(capsule.unlockDate) * 1000} />
                </div>
                
                {canUnlockValue && isCreator && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <button 
                      onClick={handleUnlock}
                      disabled={txStatus === 'pending'}
                      className="w-full sm:w-auto px-8 py-3 bg-[#c4a67e] hover:bg-[#b0946b] disabled:opacity-50 text-[#080809] font-bold text-[11px] uppercase tracking-widest rounded transition-all"
                    >
                      {txStatus === 'pending' ? 'Unlocking...' : 'Unlock Capsule Now'}
                    </button>
                    {txHash && (
                      <p className="text-[10px] uppercase tracking-widest mt-3 text-[#c4a67e] font-bold">Transaction pending...</p>
                    )}
                  </div>
                )}
                {canUnlockValue && !isCreator && (
                  <p className="mt-6 text-[10px] uppercase tracking-widest font-bold text-amber-500 border border-amber-500/20 bg-amber-500/10 p-3 rounded lg inline-block">
                    This capsule is ready, but only the creator can trigger the unlock transaction.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-green-500/20 rounded p-6 md:p-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                  <Unlock className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-serif italic text-green-500">Revealed Content Hash</h3>
                </div>
                <div className="font-mono text-white/80 break-all bg-[#0a0a0c] p-4 rounded border border-white/5 tracking-widest text-[11px]">
                  {capsule.contentHash}
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mt-4">
                  * Note: In a full production implementation, this hash would automatically fetch the decrypted content from IPFS/Arweave.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
            <div className="text-white/40">
              NFT Token ID: <span className="font-mono text-[#c4a67e]">{capsule.nftTokenId.toString()}</span>
            </div>
            <a 
              href={`https://liteforge.explorer.caldera.xyz/token/0x11C2B58d5cE395c9C9dADe8690295E17B192bd87`}
              target="_blank"
              rel="noreferrer"
              className="text-[#c4a67e] hover:text-[#b0946b] flex items-center gap-1"
            >
              View Contract <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
