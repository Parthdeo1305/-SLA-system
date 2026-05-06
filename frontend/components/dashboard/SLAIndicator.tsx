'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SLAIndicatorProps {
  deadline: string;
  isTerminal?: boolean;
}

export default function SLAIndicator({ deadline, isTerminal }: SLAIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (isTerminal) return;

    const update = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target.getTime() - now.getTime();
      
      const absoluteDiff = Math.abs(diff);
      const hours = Math.floor(absoluteDiff / (1000 * 60 * 60));
      const mins = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      
      if (diff > 0) {
        setTimeLeft(`Due in ${timeStr}`);
        setIsDelayed(false);
      } else {
        setTimeLeft(`Delayed by ${timeStr}`);
        setIsDelayed(true);
      }
    };

    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deadline, isTerminal]);

  if (isTerminal) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isDelayed ? 'text-[var(--color-danger-text)]' : 'text-[var(--badge-delivered-text)]'}`}>
      {isDelayed ? <AlertTriangle size={12} /> : <Clock size={12} />}
      <span>{timeLeft}</span>
    </div>
  );
}
