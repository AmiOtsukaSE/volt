import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volt - Open Development Platform",
  description: "Cyberpunk CEO cockpit dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-emerald-50`}
      >
        <div className="relative min-h-screen bg-black">
          <header className="sticky top-0 z-30 border-b border-emerald-500/30 bg-gradient-to-r from-black via-emerald-950/40 to-black px-4 py-4 backdrop-blur md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-mono tracking-[0.5em] text-emerald-500">
                  VOLT OPS ターミナル
                </p>
                <p className="text-lg font-semibold text-emerald-100">
                  オープン開発プラットフォーム
                </p>
              </div>
              <nav className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link
                  href="/"
                  className="rounded-full border border-emerald-400/50 px-4 py-2 text-emerald-100 transition hover:border-emerald-200 hover:text-emerald-200"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/hackathon"
                  className="rounded-full border border-emerald-400/50 px-4 py-2 text-emerald-100 transition hover:border-emerald-200 hover:text-emerald-200"
                >
                  ハッカソン情報
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
