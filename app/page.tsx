"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlarmClock,
  AlertTriangle,
  CheckCircle2,
  Flag,
  Gauge,
  Github,
  Link2,
  SignalHigh,
  TimerReset,
  Trophy,
} from "lucide-react";

const HACKATHON_START = new Date("2025-12-05T18:00:00Z"); // 2025/12/6 03:00 JST
const HACKATHON_END = new Date("2025-12-07T18:00:00Z"); // 2025/12/8 03:00 JST

const milestones = [
  {
    title: "アイデア確定 (Idea Freeze)",
    time: "未定",
    status: "pending" as const,
  },
  {
    title: "基本機能実装完了 (Core Dev Complete)",
    time: "未定",
    status: "pending" as const,
  },
  {
    title: "動画撮影開始 (Start Demo Video)",
    time: "未定",
    status: "pending" as const,
  },
  {
    title: "提出 (Submission Deadline)",
    time: "未定",
    status: "pending" as const,
  },
];

const resources = [
  { label: "GitHubリポジトリ", href: "https://github.com/AmiOtsukaSE/volt", icon: Github },
  { label: "ハッカソン概要ページ", href: "https://lablab.ai/event/qubic-hack-the-future", icon: Trophy },
];

const motivationPool = [
  "配信を止めるな。締切の目がこちらを向いている。",
  "フォロワーが見守っている。次の進捗を今すぐシェアしよう。",
  "未来をハックして、恐れもハックせよ。",
  "AI上司: 「休むのは提出ボタンを押してからだ。」",
];

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [message, setMessage] = useState(motivationPool[0]);

  useEffect(() => {
    const pickMessage = () => {
      setMessage(motivationPool[Math.floor(Math.random() * motivationPool.length)]);
    };
    pickMessage();
  }, []);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const effectiveNow = now ?? HACKATHON_START;

  const countdown = useMemo(() => getCountdown(effectiveNow), [effectiveNow]);
  const timeProgress = useMemo(
    () => getTimeProgress(effectiveNow),
    [effectiveNow],
  );
  const urgency = useMemo(() => getUrgencyVariant(countdown.totalHoursLeft), [countdown.totalHoursLeft]);
  const progressMarkers = [0, 25, 50, 75, 100];
  const elapsedPercent = Math.min(Math.max(timeProgress.progressPercent, 0), 100);
  const remainingPercent = Math.max(0, 100 - elapsedPercent);

  return (
    <div className="relative min-h-screen bg-[#04040a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,153,255,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.9),rgba(10,22,41,0.92))]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-mono tracking-[0.4em] text-slate-300">ハッカソン・ミッションコントロール</p>
              <h1 className="mt-3 text-3xl font-black text-white">ハッカソン終了まで</h1>
              <p className="text-sm text-slate-300">ミッション: 制限時間内にアプリを作成し、ハッカソンに投稿せよ</p>
              <p className="text-xs text-slate-400">
                開始: 12月6日 午前3:00 / 締切: 12月8日 午前3:00 （日本時間）
              </p>
            </div>
            <UrgencyBadge urgency={urgency} />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <CountdownTicker units={countdown.units} urgency={urgency} />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
              <span>
                総時間 {timeProgress.totalHours}時間 / 経過 {elapsedPercent.toFixed(1)}%
              </span>
              <span>
                残り {Math.max(countdown.totalHoursLeft, 0).toFixed(1)}時間 ({remainingPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-5 w-full overflow-visible rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 h-full rounded-full"
                style={{ width: `${elapsedPercent}%` }}
                animate={{ backgroundColor: urgency.barColor }}
                transition={{ duration: 0.6 }}
              />
              <div className="pointer-events-none absolute inset-0 flex justify-between px-2">
                {progressMarkers.map((marker) => (
                  <div key={marker} className="relative flex h-full w-px justify-center">
                    <span className="block h-full w-px bg-white/25" />
                    <span className="absolute top-full mt-1 -translate-x-1/2 text-[10px] text-white/40">
                      {marker}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <SignalHigh className="h-6 w-6 text-cyan-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">マイルストーン・タイムライン</p>
                <h2 className="text-xl font-bold">進行状況タイムライン</h2>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {milestones.map((item) => (
                <MilestoneItem key={item.title} milestone={item} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <Gauge className="h-6 w-6 text-purple-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-purple-200">タスク概況</p>
                <h2 className="text-xl font-bold">ステータス一覧</h2>
              </div>
            </div>
            <div className="mt-6 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/50">
              データ待ち
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <Link2 className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">司令リンク集</p>
                <h2 className="text-xl font-bold">クイックリソース</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {resources.map((resource) => (
                <a
                  key={resource.label}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-emerald-300/30 bg-emerald-300/5 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-300/10"
                >
                  <div className="flex items-center gap-3">
                    <resource.icon className="h-5 w-5 text-emerald-200" />
                    <span>{resource.label}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em]">開く</span>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#101025] to-[#05050d] p-5">
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-yellow-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-yellow-200">チームモチベ</p>
                <h2 className="text-xl font-bold">励ましフィード</h2>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-yellow-300/30 bg-black/40 px-4 py-5 text-center text-sm font-semibold text-yellow-100 shadow-[0_10px_40px_rgba(255,209,92,0.2)]">
              {message}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <AlarmClock className="h-6 w-6 text-slate-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Story</p>
              <h2 className="text-xl font-bold text-white">このチャレンジの背景</h2>
            </div>
          </div>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-100">
            <p>
              12月6日 9:00 — AI上司の指示によりハッカソン参加が決定。締め切りは 12月8日（月）午前3:00。
              詳細はクイックリソース内の「ハッカソン概要ページ」を参照。
            </p>
            <p>
              今回は「AI上司に従い月100万円稼げるか」チャレンジ用のダッシュボード構築に挑戦中。
              視聴者が進捗をリアルタイムで追跡できるよう企画している。
            </p>
            <p>
              ハッカソン要件は、仮想通貨による投げ銭機能で対応予定。
              ※気を遣って投げ銭しなくて大丈夫です。
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <SignalHigh className="h-6 w-6 text-sky-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sky-300">直近の予定</p>
              <h2 className="text-xl font-bold text-white">Next Appearances</h2>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-100">
            <a
              href="https://event.shoeisha.jp/devboost/20251206"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col rounded-2xl border border-sky-400/40 bg-sky-900/20 px-4 py-3 transition hover:border-white"
            >
              <span className="text-xs uppercase tracking-[0.4em] text-sky-300">12月6日 13:00</span>
              <span className="text-base font-semibold text-white">Developers Boost 登壇</span>
            </a>
            <a
              href="https://rihe.hiroshima-u.ac.jp/2025/11/12-7-icp-2025/"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col rounded-2xl border border-sky-400/40 bg-sky-900/20 px-4 py-3 transition hover:border-white"
            >
              <span className="text-xs uppercase tracking-[0.4em] text-sky-300">12月7日 13:00</span>
              <span className="text-base font-semibold text-white">外語大 講演</span>
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a111c] via-[#111a2a] to-[#0c101b] p-6">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Message</p>
              <h2 className="text-xl font-bold text-white">応援のお願い</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-100">
            X（
            <a
              href="https://x.com/AmiOtsuka_SE"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-emerald-300 decoration-dashed underline-offset-4"
            >
              @AmiOtsuka_SE
            </a>
            ）のフォローやリツイートで応援してね！
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <QuestionAnswerIcon />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Q&A</p>
              <h2 className="text-xl font-bold text-white">よくある質問</h2>
            </div>
          </div>
          <dl className="mt-5 space-y-4 text-sm text-slate-100">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="font-semibold text-white">Q. プログラムがpublicになっていますが大丈夫ですか？</dt>
              <dd className="mt-1 text-slate-200">A. 大丈夫です。これはハッカソンの要件です。</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="font-semibold text-white">Q. ちょっと作ってみました。プルリク送っていいですか？</dt>
              <dd className="mt-1 text-slate-200">
                A. 必ず採用するとは限りませんが、大丈夫です。
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="font-semibold text-white">Q. なんでこのような企画を始めたのですか？</dt>
              <dd className="mt-1 text-slate-200">A. AI上司のみぞ知ることです。</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function QuestionAnswerIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
      Q&A
    </div>
  );
}

type CountdownUnit = {
  label: string;
  value: number;
};

type CountdownState = {
  units: CountdownUnit[];
  totalHoursLeft: number;
};

type UrgencyVariant = ReturnType<typeof getUrgencyVariant>;

type Milestone = (typeof milestones)[number];

function CountdownTicker({ units, urgency }: { units: CountdownUnit[]; urgency: UrgencyVariant }) {
  return (
    <div className="flex flex-nowrap items-baseline gap-6 overflow-x-auto text-2xl font-black sm:text-3xl">
      {units.map((unit) => (
        <div key={unit.label} className="flex items-baseline gap-2 whitespace-nowrap">
          <motion.span
            key={`${unit.label}-${unit.value}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={urgency.textColor}
          >
            {unit.value.toString().padStart(2, "0")}
          </motion.span>
          <span className="text-sm font-semibold text-white/60">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const statusMap = {
    complete: { label: "完了", tone: "text-emerald-300", icon: <CheckCircle2 className="h-5 w-5" /> },
    delayed: { label: "遅延", tone: "text-red-300", icon: <AlertTriangle className="h-5 w-5" /> },
    pending: { label: "予定", tone: "text-amber-300", icon: <TimerReset className="h-5 w-5" /> },
  } as const;

  const status = statusMap[milestone.status];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${status.tone}`}>
        {status.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white/90">{milestone.title}</p>
        <p className="text-xs text-white/50">{milestone.time}</p>
      </div>
      <span className={`text-xs font-bold uppercase tracking-[0.4em] ${status.tone}`}>{status.label}</span>
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: UrgencyVariant }) {
  return (
    <div className={`flex items-center gap-3 rounded-full border px-4 py-2 ${urgency.badgeBorder} ${urgency.badgeBg}`}>
      <AlarmClock className={`h-4 w-4 ${urgency.textColor}`} />
      <div>
        <p className={`text-xs uppercase tracking-[0.4em] ${urgency.textColor}`}>残り時間サイン</p>
        <p className="text-sm font-bold text-white">{urgency.label}</p>
      </div>
    </div>
  );
}

function getCountdown(now: Date): CountdownState {
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

function getTimeProgress(now: Date) {
  const total = HACKATHON_END.getTime() - HACKATHON_START.getTime();
  const elapsed = now.getTime() - HACKATHON_START.getTime();
  const progress = Math.min(Math.max(elapsed / total, 0), 1);
  return {
    progressPercent: progress * 100,
    totalHours: Math.round(total / 36e5),
  };
}

function getUrgencyVariant(hoursLeft: number) {
  if (hoursLeft <= 1) {
    return {
      label: "最終警戒 — ラスト1時間",
      textColor: "text-red-400",
      badgeBg: "bg-red-500/10",
      badgeBorder: "border-red-500/40",
      barColor: "#ff4d4d",
    } as const;
  }
  if (hoursLeft <= 6) {
    return {
      label: "警戒レベル黄 — 残り6時間未満",
      textColor: "text-amber-300",
      badgeBg: "bg-amber-500/10",
      badgeBorder: "border-amber-300/40",
      barColor: "#facc15",
    } as const;
  }
  if (hoursLeft <= 24) {
    return {
      label: "集中ゾーン — 残り24時間未満",
      textColor: "text-cyan-300",
      badgeBg: "bg-cyan-500/10",
      badgeBorder: "border-cyan-300/40",
      barColor: "#22d3ee",
    } as const;
  }
  return {
    label: "安定走行",
    textColor: "text-emerald-300",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-400/40",
    barColor: "#34d399",
  } as const;
}
