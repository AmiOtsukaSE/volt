import { kv } from "@vercel/kv";
import Link from "next/link";

const VISIT_KEY = "volt:visits";
const hasKvConfig =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN) && Boolean(process.env.KV_URL);

async function getVisitCount() {
  if (!hasKvConfig) return null;
  const total = await kv.get<number>(VISIT_KEY);
  return typeof total === "number" ? total : 0;
}

export default async function AdminPage() {
  const visitCount = await getVisitCount();

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
