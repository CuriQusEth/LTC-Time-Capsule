import { useEffect, useState } from 'react';

interface Props {
  targetDate: number;
}

export function CountdownTimer({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();
      if (difference <= 0) return null;
      return {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (!left) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2 text-center text-white/80">
      <div className="flex-1 bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-2 flex flex-col justify-center">
        <span className="text-xl font-serif text-[#c4a67e]">{timeLeft.d}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Days</span>
      </div>
      <div className="flex-1 bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-2 flex flex-col justify-center">
        <span className="text-xl font-serif text-[#c4a67e]">{timeLeft.h}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Hrs</span>
      </div>
      <div className="flex-1 bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-2 flex flex-col justify-center">
        <span className="text-xl font-serif text-[#c4a67e]">{timeLeft.m}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Min</span>
      </div>
      <div className="flex-1 bg-[#0a0a0c] border border-[#c4a67e]/20 rounded p-2 flex flex-col justify-center">
        <span className="text-xl font-serif text-[#c4a67e]">{timeLeft.s}</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Sec</span>
      </div>
    </div>
  );
}
