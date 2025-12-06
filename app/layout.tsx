import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HackathonTicker from "./components/HackathonTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whatcha - Casual Dev Playground",
  description: "気軽に進捗を共有するカジュアルな開発ダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fff8f0] text-slate-900`}
      >
        <div className="relative min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fffdf9] to-[#ffe7db]">
          <header className="sticky top-0 z-30 border-b border-orange-200/70 bg-white/90 px-4 py-4 backdrop-blur shadow-[0_10px_30px_rgba(255,173,133,0.2)] md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-orange-400">
                  Creator Playground
                </p>
                <p className="text-4xl font-black tracking-tight text-slate-900">Whatcha</p>
                <p className="text-sm text-slate-500">気軽に進捗をシェアするカジュアルな開発スタジオ</p>
              </div>
              <nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                <Link
                  href="/"
                  className="rounded-full border border-orange-200 bg-white/70 px-4 py-2 shadow-sm transition hover:bg-orange-50 hover:text-orange-500"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/hackathon"
                  className="rounded-full border border-orange-200 bg-white/70 px-4 py-2 shadow-sm transition hover:bg-orange-50 hover:text-orange-500"
                >
                  ハッカソン情報
                </Link>
              </nav>
            </div>
          </header>
          <HackathonTicker />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
