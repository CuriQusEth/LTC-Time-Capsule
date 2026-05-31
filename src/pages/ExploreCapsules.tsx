import { useEffect, useState } from 'react';
import { CapsuleCard } from '../components/CapsuleCard';
import { CapsuleData } from '../types/utils';
import { useWeb3 } from '../lib/Web3Provider';
import { withRetry } from '../lib/rpcRetry';
import { Search } from 'lucide-react';

export function ExploreCapsules() {
  const { contract } = useWeb3();
  const [capsules, setCapsules] = useState<CapsuleData[]>([]);
  const [filtered, setFiltered] = useState<CapsuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const total = await withRetry(() => contract.getTotalCapsules());
        const totalNum = Number(total);
        if (totalNum === 0) {
          setLoading(false);
          return;
        }
        const limit = Math.min(totalNum, 100);
        const offset = Math.max(0, totalNum - 100);
        const all = await withRetry(() => contract.getAllCapsules(offset, limit)) as CapsuleData[];
        const valid = [...all.filter(c => c.exists)].reverse();
        setCapsules(valid);
        setFiltered(valid);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load. Please refresh.');
        setLoading(false);
      }
    };
    load();
  }, [contract]);

  useEffect(() => {
    let result = capsules;
    if (filter === 'locked') result = result.filter(c => !c.isUnlocked);
    if (filter === 'unlocked') result = result.filter(c => c.isUnlocked);
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }
    
    setFiltered(result);
  }, [filter, search, capsules]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif italic mb-2">Explore Archive</h1>
          <p className="text-white/40">Discover time-locked messages across the network.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 flex items-center bg-[#0a0a0c] border border-white/10 focus:border-[#c4a67e]/50 rounded text-white placeholder-white/30 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          <div className="flex bg-[#0a0a0c] rounded p-1 border border-white/10">
            {(['all', 'locked', 'unlocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-colors ${
                  filter === f ? 'bg-[#c4a67e]/20 text-[#c4a67e]' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-500 bg-red-500/10 rounded border border-red-500/20">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#0a0a0c] h-64 rounded border border-white/5" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((capsule) => (
            <CapsuleCard key={capsule.id.toString()} capsule={capsule} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0a0a0c] border border-white/5 rounded">
          <div className="text-white/40 mb-2">No capsules match your filters.</div>
          <button 
            onClick={() => {setFilter('all'); setSearch('');}}
            className="text-[#c4a67e] hover:text-[#b0946b] font-bold text-[11px] uppercase tracking-widest"
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}
