"use client";

import { useEffect, useState } from "react";
import { CountdownState, getCountdown } from "../lib/hackathonTiming";

export default function HackathonTicker() {
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdown(new Date()));

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(new Date()));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-orange-200/70 bg-white/80 px-4 py-3 text-slate-700 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p className="text-xs font-mono font-bold uppercase tracking-[0.35em] text-orange-400 sm:text-sm">
          ハッカソン終了まで
        </p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-lg text-slate-900 sm:text-xl">
          {countdown.units.map((unit) => (
            <span key={unit.label} className="flex items-baseline gap-1">
              <span className="text-orange-500">{unit.value.toString().padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{unit.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
