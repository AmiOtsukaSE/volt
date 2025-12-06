import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const VISIT_KEY = "volt:visits";
const hasKvConfig =
  Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN) && Boolean(process.env.KV_URL);

export async function POST() {
  if (!hasKvConfig) {
    return NextResponse.json({ count: 0, kvConfigured: false });
  }

  try {
    const count = await kv.incr(VISIT_KEY);
    return NextResponse.json({ count, kvConfigured: true });
  } catch (error) {
    console.error("Failed to increment visit count", error);
    return NextResponse.json({ error: "Failed to increment visit count" }, { status: 500 });
  }
}
