import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Zap, Clock } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Provider';
import { CapsuleCard } from '../components/CapsuleCard';
import { CapsuleData } from '../types/utils';
import { withRetry } from '../lib/rpcRetry';

export function Home() {
  const { contract } = useWeb3();
  const [stats, setStats] = useState({ total: 0, locked: 0, unlocked: 0 });
  const [recent, setRecent] = useState<CapsuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const total = await withRetry(() => contract.getTotalCapsules());
        const totalNum = Number(total);
        if (totalNum === 0) {
          setLoading(false);
          return;
        }

        const fetchOffset = Math.max(0, totalNum - 6);
        const allRecent = await withRetry(() => contract.getAllCapsules(fetchOffset, 6)) as CapsuleData[];
        
        const validRecent = [...allRecent.filter(c => c.exists)].reverse();
        
        // Approximate stats based on total
        let unlockedCount = 0;
        let lockedCount = 0;
        if (totalNum > 0 && totalNum <= 100) {
            const allStr = await withRetry(() => contract.getAllCapsules(0, totalNum)) as CapsuleData[];
            unlockedCount = allStr.filter(c => c.isUnlocked).length;
            lockedCount = totalNum - unlockedCount;
        }

        setRecent(validRecent);
        setStats({ total: totalNum, locked: lockedCount || totalNum, unlocked: unlockedCount });
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch data from the blockchain.');
        setLoading(false);
      }
    };
    fetchData();
  }, [contract]);

  return (
    <main className="pb-24">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#c4a67e_0%,transparent_60%)] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">LitVM LiteForge Testnet</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic mb-6 tracking-tight">
              Seal Your Legacy on the <span className="text-[#c4a67e]">Blockchain</span>
            </h1>
            <p className="text-base md:text-lg text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create an immutable time capsule using zero-knowledge technology. 
              Lock your letters, predictions, and memories until the exact moment you choose.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create"
                className="w-full sm:w-auto px-8 py-3 bg-[#c4a67e] hover:bg-[#b0946b] text-[#080809] font-bold text-[11px] uppercase tracking-widest rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Capsule
              </Link>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold text-[11px] uppercase tracking-widest rounded transition-all"
              >
                Explore Archive
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Capsules', value: stats.total.toString() },
            { label: 'Locked Memories', value: stats.locked > 0 ? stats.locked.toString() : '-' },
            { label: 'Revealed', value: stats.unlocked > 0 ? stats.unlocked.toString() : '-' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0a0a0c] border border-white/5 rounded p-6 text-center">
              <div className="text-[10px] font-bold text-white/30 mb-2 uppercase tracking-[0.3em]">{stat.label}</div>
              <div className="text-4xl font-serif italic text-[#c4a67e]">
                {loading ? '-' : stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <h2 className="text-3xl font-serif italic text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-[#c4a67e]/0 via-[#c4a67e]/20 to-[#c4a67e]/0" />
          
          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded text-center relative z-10">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded flex items-center justify-center mb-6 border border-white/10">
              <Clock className="w-8 h-8 text-[#c4a67e]" />
            </div>
            <h3 className="text-xl font-serif italic text-[#c4a67e] mb-3">1. Set the Date</h3>
            <p className="text-white/40 text-sm leading-relaxed">Choose any future date up to 10 years away for your capsule to unlock.</p>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded text-center relative z-10">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded flex items-center justify-center mb-6 border border-white/10">
              <Lock className="w-8 h-8 text-[#c4a67e]" />
            </div>
            <h3 className="text-xl font-serif italic text-[#c4a67e] mb-3">2. Cryptographic Lock</h3>
            <p className="text-white/40 text-sm leading-relaxed">Your content is hashed and secured by LitVM Smart Contracts. Immutable and tamper-proof.</p>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded text-center relative z-10">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded flex items-center justify-center mb-6 border border-white/10">
              <Zap className="w-8 h-8 text-[#c4a67e]" />
            </div>
            <h3 className="text-xl font-serif italic text-[#c4a67e] mb-3">3. Reveal to the World</h3>
            <p className="text-white/40 text-sm leading-relaxed">When the time comes, interact with the contract to verify and reveal the capsule directly on-chain.</p>
          </div>
        </div>
      </section>

      {/* Recent Capsules Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif italic mb-2">Recent Archives</h2>
            <p className="text-white/40">The latest moments preserved on the network.</p>
          </div>
          <Link to="/explore" className="text-[#c4a67e] hover:text-[#b0946b] font-medium text-[11px] uppercase tracking-widest hidden sm:block">View All →</Link>
        </div>

        {error ? (
          <div className="text-center py-12 text-red-500 bg-red-500/10 rounded border border-red-500/20">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#0a0a0c] h-64 rounded border border-white/5" />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((capsule) => (
              <CapsuleCard key={capsule.id.toString()} capsule={capsule} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0a0a0c] border border-white/5 rounded text-white/40">
            No capsules found. Be the first to create one!
          </div>
        )}
      </section>
    </main>
  );
}
