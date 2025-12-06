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
    <div className="border-b border-emerald-500/20 bg-[rgba(3,16,12,0.9)] px-4 py-3 text-emerald-100 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-emerald-400">
          ハッカソン終了まで
        </p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-lg sm:text-xl">
          {countdown.units.map((unit) => (
            <span key={unit.label} className="flex items-baseline gap-1">
              <span className="text-emerald-200">{unit.value.toString().padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500">{unit.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
