"use client";

import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import {
  getCountdown,
  getTimeProgress,
  getUrgencyVariant,
  HACKATHON_START,
  type CountdownUnit,
  type UrgencyVariant,
} from "../lib/hackathonTiming";

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

const tasks = [
  { title: "制作するものの概要を作る", status: "pending" as const },
  { title: "ハッカソンの概要を理解する", status: "pending" as const },
  { title: "簡単な計画を作成する", status: "pending" as const },
  { title: "書いたコード数が自動で表示されるようにする", status: "pending" as const },
  { title: "書いた文章の行数を手動で登録できるようにする", status: "pending" as const },
  { title: "キーボードのタイプ数やマウスのクリック数の計測", status: "pending" as const },
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

type HomeClientProps = {
  adminStatsSlot: ReactNode;
};

type ActivityData = {
  keystrokes: number;
  clicks: number;
  lastUpdate: string;
  isOnline: boolean;
};

type ActivityApiResponse = {
  enabled: boolean;
  data: ActivityData | null;
  error?: string;
};

type ActivityState =
  | { status: "ready"; data: ActivityData }
  | { status: "loading" | "disabled" | "empty" | "error" };

export default function HomeClient({ adminStatsSlot }: HomeClientProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [message, setMessage] = useState(motivationPool[0]);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [visitCounterStatus, setVisitCounterStatus] = useState<"loading" | "ready" | "disabled">("loading");
  const [activityStatus, setActivityStatus] = useState<ActivityState>({ status: "loading" });

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

  useEffect(() => {
    const incrementVisits = async () => {
      try {
        const response = await fetch("/api/visits", { method: "POST" });
        if (!response.ok) throw new Error("Failed to update visit counter");
        const payload = (await response.json()) as { count?: number; kvConfigured?: boolean };
        if (typeof payload.count === "number") {
          setVisitCount(payload.count);
        }
        setVisitCounterStatus(payload.kvConfigured === false ? "disabled" : "ready");
      } catch (error) {
        console.error(error);
        setVisitCounterStatus("disabled");
      }
    };

    incrementVisits();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchActivityStatus = async () => {
      try {
        const response = await fetch("/api/activity-log", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load activity log");
        const payload = (await response.json()) as ActivityApiResponse;
        if (!isMounted) {
          return;
        }
        if (payload.enabled === false) {
          setActivityStatus({ status: "disabled" });
          return;
        }
        if (!payload.data) {
          setActivityStatus({ status: "empty" });
          return;
        }
        setActivityStatus({ status: "ready", data: payload.data });
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setActivityStatus({ status: "error" });
        }
      }
    };

    fetchActivityStatus();
    const interval = setInterval(fetchActivityStatus, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
              <span role="img" aria-label="laptop woman">
                👩‍💻
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Now</p>
              <h2 className="text-xl font-bold text-white">今の大塚あみ</h2>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <ActivityStatusCard state={activityStatus} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <AlarmClock className="h-6 w-6 text-slate-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Overview</p>
              <h2 className="text-xl font-bold text-white">このチャレンジの概要</h2>
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

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
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
          <div className="mt-4 flex flex-wrap gap-4">
            <VisitCounterCard count={visitCount} status={visitCounterStatus} />
            {adminStatsSlot}
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
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
              <span role="img" aria-label="laptop woman">
                👩‍💻
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Now</p>
              <h2 className="text-xl font-bold text-white">今の大塚あみ</h2>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <ActivityStatusCard state={activityStatus} />
          </div>
        </section>

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
            <div className="mt-6 space-y-2">
              {tasks.map((task) => (
                <TaskItem key={task.title} task={task} />
              ))}
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

function VisitCounterCard({ count, status }: { count: number | null; status: "loading" | "ready" | "disabled" }) {
  const helperLabel = status === "disabled" ? "KV未設定" : status === "loading" ? "同期中..." : "Vercel KV";

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">アクセス数</p>
        <p className="text-sm text-slate-300">このダッシュボードの訪問総数</p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-black text-white">{count !== null ? count.toLocaleString() : "--"}</p>
        <p className="text-[10px] text-white/40">{helperLabel}</p>
      </div>
    </div>
  );
}

type Task = (typeof tasks)[number];

function TaskItem({ task }: { task: Task }) {
  const statusMap = {
    complete: { label: "完了", tone: "text-emerald-300", icon: <CheckCircle2 className="h-4 w-4" /> },
    in_progress: { label: "進行中", tone: "text-cyan-300", icon: <TimerReset className="h-4 w-4" /> },
    pending: { label: "未着手", tone: "text-slate-400", icon: <Flag className="h-4 w-4" /> },
  } as const;

  const status = statusMap[task.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className={`${status.tone}`}>{status.icon}</div>
      <p className="flex-1 text-sm text-white/80">{task.title}</p>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${status.tone}`}>{status.label}</span>
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

function ActivityStatusCard({ state }: { state: ActivityState }) {
  const isReady = state.status === "ready";
  const data = isReady ? state.data : null;
  const isOnline = Boolean(isReady && data?.isOnline);

  let indicatorClass = "bg-slate-600";
  let statusLabel = "同期中...";
  let helper = "Postgresから読み込み中";

  if (state.status === "ready" && data) {
    indicatorClass = data.isOnline
      ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]"
      : "bg-slate-500";
    statusLabel = data.isOnline ? "Online (作業中)" : "Offline (休憩中)";
    helper = data.isOnline ? "ストリーム監視中 / Discordにも常駐" : "しばし休憩中";
  } else if (state.status === "disabled") {
    indicatorClass = "bg-amber-400";
    statusLabel = "データ未設定";
    helper = "Postgres接続を設定してください";
  } else if (state.status === "empty") {
    indicatorClass = "bg-slate-500";
    statusLabel = "データ未登録";
    helper = "API経由でactivity_logsにデータを送信してください";
  } else if (state.status === "error") {
    indicatorClass = "bg-red-400";
    statusLabel = "取得エラー";
    helper = "APIレスポンスを確認してください";
  }

  const keystrokesDisplay = isReady && data ? data.keystrokes.toLocaleString() : "--";
  const clicksDisplay = isReady && data ? data.clicks.toLocaleString() : "--";
  const videoSrc = isOnline ? "/working.mp4" : "/sleeping.mp4";
  const videoCaption = isOnline ? "Live: 作業中" : "Live: 休憩モード";

  let lastUpdateText = "最終更新: 同期中...";
  if (state.status === "ready" && data) {
    lastUpdateText = `最終更新: ${new Date(data.lastUpdate).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    })}`;
  } else if (state.status === "empty") {
    lastUpdateText = "最終更新: データ未登録";
  } else if (state.status === "disabled") {
    lastUpdateText = "最終更新: Postgres未設定";
  } else if (state.status === "error") {
    lastUpdateText = "最終更新: 取得失敗";
  }

  return (
    <>
      <ActivityVideo src={videoSrc} caption={videoCaption} />
      <div className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label="laptop woman">
          👩‍💻
        </span>
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`} />
            {statusLabel}
          </div>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
      </div>
      <dl className="mt-6 space-y-3 text-sm text-slate-100">
        <div className="flex items-baseline justify-between">
          <dt className="text-slate-300">キー入力速度</dt>
          <dd className="text-2xl font-black text-white">
            {keystrokesDisplay} <span className="ml-1 text-xs font-normal text-slate-400">回/10分</span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-slate-300">クリック数</dt>
          <dd className="text-2xl font-black text-white">
            {clicksDisplay} <span className="ml-1 text-xs font-normal text-slate-400">回/10分</span>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-right text-xs font-mono text-slate-400">{lastUpdateText}</p>
    </>
  );
}

function ActivityVideo({ src, caption }: { src: string; caption: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const handleLoaded = () => {
      if (node.videoWidth && node.videoHeight) {
        setAspectRatio(node.videoWidth / node.videoHeight);
      }
    };

    node.addEventListener("loadedmetadata", handleLoaded);
    handleLoaded();
    return () => {
      node.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [src]);

  const containerStyle: CSSProperties =
    aspectRatio !== null ? { aspectRatio: aspectRatio / 0.6 } : { minHeight: "200px" };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40">
      <div className="relative w-full overflow-hidden rounded-t-2xl bg-black" style={containerStyle}>
        <video
          key={src}
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-xs text-slate-300">
        <span>{caption}</span>
        <span className="font-mono uppercase tracking-[0.3em] text-slate-500">STATUS</span>
      </div>
    </div>
  );
}
