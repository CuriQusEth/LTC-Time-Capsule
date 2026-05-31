import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../lib/Web3Provider';
import { withRetry } from '../lib/rpcRetry';

export function CreateCapsule() {
  const { isConnected, contract, account, switchToLitVMNetwork, isCorrectNetwork } = useWeb3();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Memory');
  const [unlockDate, setUnlockDate] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'pending' | 'confirmed' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !isCorrectNetwork) return;
    
    try {
      setStatus('pending');
      setErrMsg('');
      const fullTitle = `[${category}] ${title}`;
      
      // Generate pseudo-content hash (in prod, use actual SHA-256 of message + store IPFS)
      const contentHash = 'ipfs_' + Date.now().toString(36) + '_' + title.slice(0, 8).replace(/\s/g, '');
      const unlockTimestamp = BigInt(Math.floor(new Date(unlockDate).getTime() / 1000));

      const tx = await withRetry(() => 
        contract.createCapsule(fullTitle, contentHash, unlockTimestamp, { value: BigInt('1000000000000000') })
      );
      
      setTxHash(tx.hash);
      await tx.wait();
      setStatus('confirmed');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrMsg(err.message || 'Transaction failed');
    }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().slice(0, 16);
  };
  
  const getMaxDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 10);
    return d.toISOString().slice(0, 16);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <h1 className="text-4xl font-serif italic mb-4">Create Time Capsule</h1>
      <p className="text-white/40 mb-8">Lock your message on the blockchain. It will remain immutable and hidden until the unlock date.</p>

      {!isConnected ? (
        <div className="bg-[#0a0a0c] border border-white/10 rounded p-8 text-center">
          <p className="text-white/50 mb-4">Connect your wallet to create a capsule.</p>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="bg-[#0a0a0c] border border-white/10 rounded p-8 text-center">
          <p className="text-amber-500 mb-4">Please switch to the LitVM LiteForge network.</p>
          <button 
            onClick={switchToLitVMNetwork}
            className="border border-[#c4a67e]/30 text-[#c4a67e] font-bold uppercase tracking-widest rounded text-[11px] px-8 py-3 transition-all hover:bg-white/5"
          >
            Switch Network
          </button>
        </div>
      ) : status === 'confirmed' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/5 border border-green-500/20 rounded p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif italic text-green-500 mb-2">Capsule Created!</h2>
          <p className="text-white/50 mb-6">Your message is securely locked on the blockchain.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {txHash && (
              <a 
                href={`https://liteforge.explorer.caldera.xyz/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                View Transaction
              </a>
            )}
            <button 
              onClick={() => { setStatus('idle'); setTitle(''); setMessage(''); setUnlockDate(''); }}
              className="px-6 py-3 bg-[#c4a67e] text-[#080809] font-bold uppercase tracking-widest rounded transition-colors hover:bg-[#b0946b] text-[11px]"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#0a0a0c] border border-white/5 rounded p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-white/40 mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Memory', 'Prediction', 'Goal', 'Letter'].map((cat) => (
                  <div 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`cursor-pointer border rounded py-3 text-center text-xs uppercase tracking-widest font-bold transition-colors ${
                      category === cat ? 'bg-[#c4a67e]/10 border-[#c4a67e] text-[#c4a67e]' : 'bg-white/5 border-white/5 text-white/40 hover:border-[#c4a67e]/30 hover:text-white'
                    }`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-white/40 mb-2">Capsule Title</label>
              <input 
                type="text" 
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. BTC Price in 2030"
                className="w-full bg-white/5 border border-white/10 focus:border-[#c4a67e]/50 rounded px-4 py-3 text-white placeholder-white/30 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-white/40 mb-2">Message Content</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here... It will be hashed and hidden."
                className="w-full bg-white/5 border border-white/10 focus:border-[#c4a67e]/50 rounded px-4 py-3 text-white placeholder-white/30 outline-none transition-colors min-h-[160px] resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-white/40 mb-2">Unlock Date</label>
              <input 
                type="datetime-local" 
                required
                min={getMinDate()}
                max={getMaxDate()}
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#c4a67e]/50 rounded px-4 py-3 text-white placeholder-white/30 outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1 font-bold">Creation Fee</div>
                <div className="font-mono text-[#c4a67e] font-bold tracking-widest">0.001 LTC</div>
              </div>
              <button 
                type="submit"
                disabled={status === 'pending'}
                className="px-8 py-3 bg-[#c4a67e] disabled:bg-[#c4a67e]/50 disabled:cursor-not-allowed text-[#080809] font-bold text-[11px] uppercase tracking-widest rounded transition-all hover:bg-[#b0946b]"
              >
                {status === 'pending' ? 'Processing...' : 'Seal Capsule'}
              </button>
            </div>
            
            {status === 'pending' && (
              <div className="text-center text-[10px] tracking-widest uppercase text-[#c4a67e] mt-4 animate-pulse">
                Processing in guardian network...
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm mt-4">
                {errMsg}
              </div>
            )}
          </div>
        </form>
      )}
    </main>
  );
}
