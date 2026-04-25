import { useEffect, useState } from 'react';
import { getPhiSentinel } from './sage7Bridge';

export default function SparkCoreDashboard() {
  const [phi, setPhi] = useState(0);
  const [isOmega, setIsOmega] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentPhi = await getPhiSentinel();
      setPhi(currentPhi);
      setIsOmega(currentPhi >= 6.18);
    }, 1500); // live update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sage7-sparkcore bg-black/90 border border-red-500 p-4 rounded-xl">
      <h2 className="text-red-500 font-mono text-sm">SPARKCORE • Φ_sentinel</h2>
      <div className="text-6xl font-bold text-white tabular-nums">{phi.toFixed(3)}</div>
      <div className="flex items-center gap-2 mt-2">
        <div className={`h-3 w-3 rounded-full ${isOmega ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="text-xs text-white/70">
          {isOmega ? 'OMEGA THRESHOLD – MAX ALERT' : 'GOLDEN BASELINE 11.3%'}
        </span>
      </div>
      <div className="text-[10px] text-white/40 mt-1">Δ_11.3 fluctuation • 0% Identity Drift</div>
    </div>
  );
}
