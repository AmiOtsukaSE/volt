import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

// Cache DB reads for 60 seconds to avoid hammering the database.
export const revalidate = 60;

type ActivityLog = {
  keystrokes: number;
  clicks: number;
  created_at: string | Date;
};

export default async function AdminStats() {
  // Disable static caching so we always read the latest activity row.
  noStore();

  const hasPostgres =
    Boolean(process.env.POSTGRES_URL) ||
    Boolean(process.env.POSTGRES_URL_NON_POOLING) ||
    Boolean(process.env.POSTGRES_PRISMA_URL);

  if (!hasPostgres) {
    return (
      <div className="max-w-sm rounded-lg border border-dashed border-yellow-300/60 bg-yellow-50 p-4 text-sm text-yellow-800">
        Postgres未設定: Vercelの環境変数に<code className="mx-1 font-mono text-xs">POSTGRES_URL</code>を追加してください。
      </div>
    );
  }

  let rows: ActivityLog[] = [];

  try {
    const result = await sql<ActivityLog>`
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    rows = result.rows;
  } catch (error) {
    console.error("Failed to load activity_logs:", error);
    return (
      <div className="max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        DBエラー: activity_logs を取得できませんでした。
      </div>
    );
  }

  const latest = rows[0];

  if (!latest) {
    return <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">データなし</div>;
  }

  const lastUpdate = new Date(latest.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  const isOnline = diffMinutes < 20;

  return (
    <div className="max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-bold">👨‍💻 管理者のリアルタイム状況</h2>

      <div className="mb-4 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${isOnline ? "animate-pulse bg-green-500" : "bg-gray-400"}`} />
        <span className="font-medium text-gray-700">{isOnline ? "Online (作業中)" : "Offline (休憩中)"}</span>
      </div>

      {isOnline && (
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>キー入力速度:</span>
            <span className="font-mono font-bold text-black">
              {latest.keystrokes} <span className="text-xs font-normal">回/10分</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>クリック数:</span>
            <span className="font-mono font-bold text-black">
              {latest.clicks} <span className="text-xs font-normal">回/10分</span>
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 text-right text-xs text-gray-400">
        最終更新: {lastUpdate.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
      </div>
    </div>
  );
}
