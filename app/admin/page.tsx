import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

const VISIT_KEY = "volt:visits";
const hasKvConfig =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN) && Boolean(process.env.KV_URL);
const hasPostgres =
  Boolean(process.env.POSTGRES_URL) ||
  Boolean(process.env.POSTGRES_URL_NON_POOLING) ||
  Boolean(process.env.POSTGRES_PRISMA_URL);

type ActivityLog = {
  keystrokes: number | null;
  clicks: number | null;
  created_at: string | Date;
};

type HourBlock = {
  hourLabel: string;
  isActive: boolean;
  totalKeystrokes: number;
  totalClicks: number;
  isFuture: boolean;
  isCurrent: boolean;
};

type ActivityInsights = {
  tableRows: ActivityLog[];
  hourlyBlocks: HourBlock[];
  lastEvent: Date | null;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

async function getVisitCount() {
  if (!hasKvConfig) return null;
  const total = await kv.get<number>(VISIT_KEY);
  return typeof total === "number" ? total : 0;
}

function toJst(date: Date) {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

function formatJst(date: Date, options?: Intl.DateTimeFormatOptions) {
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour12: false,
    ...options,
  });
}

function buildHourlyBlocks(rows: ActivityLog[]): HourBlock[] {
  const jstNow = toJst(new Date());
  const startOfDay = new Date(jstNow);
  startOfDay.setHours(0, 0, 0, 0);

  return Array.from({ length: 24 }, (_, hour) => {
    const blockStart = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
    const blockEnd = new Date(blockStart.getTime() + 60 * 60 * 1000);
    const bucket = rows.filter((row) => {
      const rowDate = toJst(new Date(row.created_at));
      return rowDate >= blockStart && rowDate < blockEnd;
    });

    const totalKeystrokes = bucket.reduce((sum, row) => sum + Number(row.keystrokes ?? 0), 0);
    const totalClicks = bucket.reduce((sum, row) => sum + Number(row.clicks ?? 0), 0);
    const isActive = totalKeystrokes + totalClicks > 0;
    const isFuture = blockStart > jstNow;
    const isCurrent = !isFuture && jstNow >= blockStart && jstNow < blockEnd;

    return {
      hourLabel: `${String(hour).padStart(2, "0")}:00`,
      isActive,
      totalKeystrokes,
      totalClicks,
      isFuture,
      isCurrent,
    };
  });
}

async function getActivityInsights(): Promise<ActivityInsights> {
  // Avoid caching so the admin sees near-realtime activity.
  noStore();
  const result = await sql<ActivityLog>`
    SELECT keystrokes, clicks, created_at
    FROM activity_logs
    WHERE created_at >= NOW() - INTERVAL '24 HOURS'
    ORDER BY created_at DESC;
  `;
  const rows = result.rows ?? [];
  return {
    tableRows: rows.slice(0, 12),
    hourlyBlocks: buildHourlyBlocks(rows),
    lastEvent: rows[0] ? new Date(rows[0].created_at) : null,
  };
}

export default async function AdminPage() {
  const visitCount = await getVisitCount();
  let activityInsights: ActivityInsights | null = null;
  let activityError: string | null = null;

  if (hasPostgres) {
    try {
      activityInsights = await getActivityInsights();
    } catch (error) {
      console.error("Failed to load activity insights:", error);
      activityError = "DBエラー: activity_logs の取得に失敗しました。";
    }
  }
  const hourlyBlocks = hasPostgres ? activityInsights?.hourlyBlocks ?? buildHourlyBlocks([]) : [];
  const tableRows = activityInsights?.tableRows ?? [];
  const lastEventLabel = activityInsights?.lastEvent
    ? formatJst(activityInsights.lastEvent, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <main className="min-h-screen bg-[#02010a] px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-blue-200">Admin Console</p>
          <h1 className="mt-3 text-4xl font-black">管理者ダッシュボード</h1>
          <p className="mt-2 text-sm text-white/70">
            この画面は Basic 認証で保護されています。ハッカソンモニターの主要指標を確認し、必要な調整を行ってください。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-200">アクセス数</p>
            <p className="mt-1 text-3xl font-black">{visitCount !== null ? visitCount.toLocaleString() : "--"}</p>
            <p className="text-xs text-white/60">{visitCount === null ? "Vercel KV 未設定" : "Vercel KV"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200">監視対象</p>
            <p className="mt-1 text-3xl font-black">4</p>
            <p className="text-xs text-white/60">進行中のタスク</p>
          </div>
        </section>

        {hasPostgres ? (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Activity log</p>
                  <h2 className="text-xl font-bold text-white">稼働状況一覧</h2>
                  <p className="text-sm text-white/60">最新12件のキー入力とクリックを表示</p>
                </div>
                {lastEventLabel && <p className="text-xs text-white/50">最終記録: {lastEventLabel} JST</p>}
              </div>
              {activityError ? (
                <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                  {activityError}
                </div>
              ) : tableRows.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.25em] text-white/40">
                        <th className="pb-2 font-normal">タイムスタンプ</th>
                        <th className="pb-2 font-normal">キー入力</th>
                        <th className="pb-2 font-normal">クリック</th>
                        <th className="pb-2 font-normal">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, index) => {
                        const timestamp = formatJst(new Date(row.created_at), {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const keystrokes = Number(row.keystrokes ?? 0);
                        const clicks = Number(row.clicks ?? 0);
                        const total = keystrokes + clicks;
                        const isWorking = total > 0;
                        return (
                          <tr key={`${row.created_at}-${index}`} className="border-t border-white/5 text-white/80">
                            <td className="py-3 pr-3 font-mono text-xs text-white">{timestamp}</td>
                            <td className="py-3 pr-3 font-mono">{keystrokes.toLocaleString()}</td>
                            <td className="py-3 pr-3 font-mono">{clicks.toLocaleString()}</td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${
                                  isWorking
                                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                                    : "border-white/20 bg-white/5 text-white/60"
                                }`}
                              >
                                {isWorking ? "稼働中" : "休憩中"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/70">まだ activity_logs にデータが登録されていません。</p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Daily timeline</p>
                  <h2 className="text-xl font-bold text-white">1日の稼働ヒートマップ</h2>
                  <p className="text-sm text-white/60">現在のJST日付を24時間ブロックで可視化</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-5 rounded-full bg-emerald-400" /> 作業中
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-5 rounded-full bg-white/30" /> 休止
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-5 rounded-full border border-cyan-300" /> 現在
                  </div>
                </div>
              </div>
              {activityError ? (
                <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                  {activityError}
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {hourlyBlocks.map((block) => {
                    const totalSignals = block.totalKeystrokes + block.totalClicks;
                    const intensityPercent = Math.min(totalSignals / 400, 1) * 100;
                    const width = block.isActive ? Math.max(intensityPercent, 25) : 15;
                    return (
                      <div
                        key={block.hourLabel}
                        className={`rounded-2xl border px-3 py-2 text-xs ${
                          block.isActive ? "border-emerald-400/60 bg-emerald-400/5" : "border-white/10 bg-white/5"
                        } ${block.isFuture ? "opacity-40" : ""} ${block.isCurrent ? "ring-1 ring-cyan-300/80" : ""}`}
                        title={`キー入力: ${block.totalKeystrokes.toLocaleString()} / クリック: ${block.totalClicks.toLocaleString()}`}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] text-white/80">
                          <span>{block.hourLabel}</span>
                          <span className={block.isActive ? "text-emerald-200" : "text-white/50"}>
                            {block.isActive ? "ON" : "OFF"}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              block.isActive ? "bg-emerald-400" : "bg-white/30"
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-white/60">
                          {totalSignals > 0
                            ? `K${block.totalKeystrokes.toLocaleString()} / C${block.totalClicks.toLocaleString()}`
                            : "入力なし"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-sm text-yellow-100">
            <p className="font-semibold text-yellow-200">Postgres 未設定</p>
            <p className="mt-2">
              稼働状況の表やヒートマップを表示するには、Vercel の環境変数に
              <code className="mx-1 rounded bg-black/30 px-1 py-0.5 text-xs">POSTGRES_URL</code>
              などの接続情報を設定してください。
            </p>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold">管理者向けリソース</h2>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <Link href="/" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span>ライブダッシュボードを開く</span>
              <span className="text-xs text-white/50">/</span>
            </Link>
            <a
              href="https://vercel.com/docs/storage/vercel-kv"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <span>Vercel KV 管理画面</span>
              <span className="text-xs text-white/50">vercel.com</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
