import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Unlock, Clock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { CapsuleData, formatAddress, formatDate, isLocked } from '../types/utils';

interface Props {
  capsule: CapsuleData;
}

export function CapsuleCard({ capsule }: Props) {
  const navigate = useNavigate();
  const locked = isLocked(capsule);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/capsule/${capsule.id}`)}
      className="bg-[#0a0a0c] border border-white/5 hover:border-[#c4a67e]/30 rounded-lg p-6 cursor-pointer flex flex-col h-full grow transition-colors duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4a67e]/5 blur-[50px] rounded-full group-hover:bg-[#c4a67e]/10 transition-colors" />

      <div className="flex justify-between items-start mb-4 z-10">
        <div className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border rounded flex items-center gap-1.5 ${
          locked ? 'bg-[#c4a67e]/10 text-[#c4a67e] border-[#c4a67e]/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
        }`}>
          {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {locked ? 'Locked' : 'Revealed'}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          {formatDate(capsule.creationDate)}
        </div>
      </div>

      <h3 className="font-serif italic text-xl text-white mb-1 truncate leading-tight z-10" title={capsule.title}>
        {capsule.title}
      </h3>
      <p className="text-[10px] uppercase tracking-widest font-mono text-white/30 mb-6 z-10">
        By {formatAddress(capsule.creator)}
      </p>

      <div className="mt-auto pt-4 border-t border-white/5 z-10">
        <div className="text-[9px] text-white/30 mb-2 font-bold uppercase tracking-[0.2em]">
          {locked ? 'Unlocks In' : 'Status'}
        </div>
        {locked ? (
          <CountdownTimer targetDate={Number(capsule.unlockDate) * 1000} />
        ) : (
          <div className="w-full bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-4 text-center text-xs uppercase tracking-widest text-[#c4a67e]">
            Content Revealed
          </div>
        )}
      </div>
    </motion.div>
  );
}
