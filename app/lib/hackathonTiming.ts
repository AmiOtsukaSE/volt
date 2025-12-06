export const HACKATHON_START = new Date("2025-12-05T18:00:00Z"); // 2025/12/6 03:00 JST
export const HACKATHON_END = new Date("2025-12-07T18:00:00Z"); // 2025/12/8 03:00 JST

export type CountdownUnit = {
  label: string;
  value: number;
};

export type CountdownState = {
  units: CountdownUnit[];
  totalHoursLeft: number;
};

export type UrgencyVariant = {
  label: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  barColor: string;
};

export function getCountdown(now: Date): CountdownState {
  const diff = HACKATHON_END.getTime() - now.getTime();
  const clamped = Math.max(diff, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return {
    units: [
      { label: "日", value: days },
      { label: "時間", value: hours },
      { label: "分", value: minutes },
      { label: "秒", value: seconds },
    ],
    totalHoursLeft: clamped / 36e5,
  };
}

export function getTimeProgress(now: Date) {
  const total = HACKATHON_END.getTime() - HACKATHON_START.getTime();
  const elapsed = now.getTime() - HACKATHON_START.getTime();
  const progress = Math.min(Math.max(elapsed / total, 0), 1);
  return {
    progressPercent: progress * 100,
    totalHours: Math.round(total / 36e5),
  };
}

export function getUrgencyVariant(hoursLeft: number): UrgencyVariant {
  if (hoursLeft <= 1) {
    return {
      label: "最終警戒 — ラスト1時間",
      textColor: "text-red-400",
      badgeBg: "bg-red-500/10",
      badgeBorder: "border-red-500/40",
      barColor: "#ff4d4d",
    };
  }
  if (hoursLeft <= 6) {
    return {
      label: "警戒レベル黄 — 残り6時間未満",
      textColor: "text-amber-300",
      badgeBg: "bg-amber-500/10",
      badgeBorder: "border-amber-300/40",
      barColor: "#facc15",
    };
  }
  if (hoursLeft <= 24) {
    return {
      label: "集中ゾーン — 残り24時間未満",
      textColor: "text-cyan-300",
      badgeBg: "bg-cyan-500/10",
      badgeBorder: "border-cyan-300/40",
      barColor: "#22d3ee",
    };
  }
  return {
    label: "安定走行",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-400/40",
    barColor: "#34d399",
  };
}
