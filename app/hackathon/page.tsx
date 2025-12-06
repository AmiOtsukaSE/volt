"use client";

import type { ComponentType, SVGProps } from "react";
import { motion } from "framer-motion";
import {
  AlarmClock,
  CalendarClock,
  ExternalLink,
  MessageSquareMore,
  Rocket,
  Shield,
  WalletMinimal,
} from "lucide-react";

const timeline = [
  {
    label: "キックオフ配信",
    detail:
      "ライブ配信でチャレンジ詳細とQubicの最新ロードマップを共有し、参加者が一斉にスタート。",
  },
  {
    label: "48時間ビルドスプリント",
    detail:
      "Discordでメンターと直接対話しながらソリューションを構築。課題への回答やレビューを即時に獲得。",
  },
  {
    label: "最終提出",
    detail:
      "デモ、ビデオ、ピッチデッキ、リポジトリを提出して審査。審査員はQubic / lablab.aiのコアチーム。",
  },
];

const tracks = [
  {
    title: "Nostromoトラック",
    amount: "$21,100+ pool",
    icon: Rocket,
    rewards: [
      "1位: $2,500 USDT + Nostromoローンチ費用免除 (最大$16,000)",
      "2位: $1,500 USDT + ローンチ費用50%オフ",
      "3位: $1,000 USDT + メンタリング特典",
    ],
    description:
      "Qubic上で本格的なプロトコル設計やローンチを目指すハードコアビルダー向けトラック。",
  },
  {
    title: "EasyConnectトラック",
    amount: "$5,400 pool",
    icon: Shield,
    rewards: [
      "1位: $2,500 USDT",
      "EasyConnectプレミアム (生涯無料)",
      "追加メンタリング・資金調達支援",
    ],
    description:
      "接続・統合を素早く形にするライトウェイトなトラック。Qubicと既存スタックを繋ぐ発想を歓迎。",
  },
];

const submissions = [
  "動作するQubicベースのプロトタイプ (審査員が触れるデモ)",
  "プロジェクト紹介ビデオ (ショートピッチ)",
  "ピッチデッキ (PDF/スライド)",
  "MIT推奨ライセンスのGitHubリポジトリ",
];

export default function HackathonPage() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#04040a] text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(25,136,255,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(1,5,15,0.92),rgba(8,35,65,0.85))]" />
      <div className="relative z-10 px-4 py-12 md:px-10">
        <div className="mx-auto max-w-5xl space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.4)]"
          >
            <p className="text-xs font-mono text-sky-300 tracking-[0.35em]">
              ハック・ザ・フューチャー // 情報
            </p>
            <h1 className="mt-4 text-4xl font-bold text-white">ハッカソンの情報</h1>
            <p className="mt-4 text-lg text-slate-200">
              lablab.ai主催の48時間オンラインハッカソン。次世代ブロックチェーン「Qubic」を全力で活用し、ネットワーク上で稼働するソリューションをローンチするための実戦的バトルです。
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoLine label="開催期間" value="2025/12/5（金）- 12/7（日）" Icon={CalendarClock} />
              <InfoLine label="場所" value="オンライン (lablab.ai / Discord)" Icon={MessageSquareMore} />
              <InfoLine label="参加費" value="無料" Icon={WalletMinimal} />
              <InfoLine label="賞金総額" value="$44,550 (約670万円)" Icon={AlarmClock} />
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-sky-950/40 p-4 text-sm text-slate-100">
              <p>
                目的: Qubicエコシステムを舞台に、新たな波となるアプリケーションやプロトコルを設計し、メンターのサポートとともに短期間でローンチ準備まで進めること。
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://lablab.ai/event/qubic-hack-the-future"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white"
              >
                公式イベントページ
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.section>

          <section className="grid gap-6 lg:grid-cols-2">
            {tracks.map((track) => {
              const TrackIcon = track.icon;
              return (
                <motion.article
                  key={track.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center gap-3">
                    <TrackIcon className="h-9 w-9 text-sky-300" />
                    <div>
                      <p className="text-xs font-mono text-sky-400/80">トラック</p>
                      <h2 className="text-2xl font-semibold text-white">{track.title}</h2>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">{track.description}</p>
                  <p className="mt-2 text-sm font-mono text-sky-300">賞金: {track.amount}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-100">
                    {track.rewards.map((reward) => (
                      <li key={reward} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                        <span>{reward}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-2xl font-semibold text-white">参加条件 & 提出物</h2>
            <p className="mt-2 text-sm text-slate-200">
              個人またはチーム参加 (lablab.aiでチーム登録)。提出締切までに以下を揃える必要があります。
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-100">
              {submissions.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-2xl font-semibold text-white">48時間タイムライン</h2>
            <div className="mt-6 space-y-6">
              {timeline.map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-mono text-sky-300 tracking-[0.2em]">{entry.label}</p>
                  <p className="mt-2 text-sm text-slate-100">{entry.detail}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

type InfoLineProps = {
  label: string;
  value: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function InfoLine({ label, value, Icon }: InfoLineProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <Icon className="h-5 w-5 text-sky-300" />
      <div>
        <p className="text-xs font-mono text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-50">{value}</p>
      </div>
    </div>
  );
}
