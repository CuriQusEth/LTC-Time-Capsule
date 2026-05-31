import { useEffect, useState } from 'react';
import { useWeb3 } from '../lib/Web3Provider';
import { CapsuleCard } from '../components/CapsuleCard';
import { CapsuleData } from '../types/utils';
import { withRetry } from '../lib/rpcRetry';
import { Link } from 'react-router-dom';

export function MyCapsules() {
  const { account, contract, isConnected } = useWeb3();
  const [capsules, setCapsules] = useState<CapsuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account || !isConnected) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const ids = await withRetry(() => contract.getCapsulesByCreator(account)) as bigint[];
        if (ids.length === 0) {
          setCapsules([]);
          setLoading(false);
          return;
        }

        const capsulePromises = ids.map(id => withRetry(() => contract.getCapsule(id)));
        const allCapsules = await Promise.all(capsulePromises) as CapsuleData[];
        const valid = allCapsules.filter(c => c && c.exists);
        setCapsules([...valid].reverse());
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load your capsules.');
        setLoading(false);
      }
    };
    load();
  }, [account, contract, isConnected]);

  const stats = {
    total: capsules.length,
    locked: capsules.filter(c => !c.isUnlocked).length,
    unlocked: capsules.filter(c => c.isUnlocked).length
  };

  if (!isConnected) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12 pb-24 text-center">
        <h1 className="text-3xl font-serif italic mb-4">My Archives</h1>
        <div className="bg-[#0a0a0c] border border-white/5 rounded p-12 mt-8">
          <p className="text-white/40 mb-6 font-bold uppercase tracking-widest text-xs">Connect your guardian to view and manage your time capsules.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">My Archives</h1>
          <p className="text-white/40">Manage your cryptographically locked memories.</p>
        </div>
        <Link 
          to="/create"
          className="px-6 py-3 bg-[#c4a67e] hover:bg-[#b0946b] text-[#080809] font-bold text-[11px] uppercase tracking-widest rounded transition-colors shrink-0"
        >
          + Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#0a0a0c] border border-white/5 rounded p-6 flex flex-col justify-center items-center">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Total Created</span>
          <span className="text-3xl font-serif italic text-white">{stats.total}</span>
        </div>
        <div className="bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-6 flex flex-col justify-center items-center">
           <span className="text-[#c4a67e] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Currently Locked</span>
           <span className="text-3xl font-serif italic text-[#c4a67e]">{stats.locked}</span>
        </div>
        <div className="bg-[#0a0a0c] border border-green-500/20 rounded p-6 flex flex-col justify-center items-center">
           <span className="text-green-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Publicly Revealed</span>
           <span className="text-3xl font-serif italic text-green-500">{stats.unlocked}</span>
        </div>
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
      ) : capsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((capsule) => (
            <CapsuleCard key={capsule.id.toString()} capsule={capsule} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0a0a0c] border border-white/5 rounded">
          <div className="text-white/40 mb-4">You haven't created any capsules yet.</div>
          <Link to="/create" className="text-[#c4a67e] hover:text-[#b0946b] font-bold text-[11px] uppercase tracking-widest">Create your first one →</Link>
        </div>
      )}
    </main>
  );
}
