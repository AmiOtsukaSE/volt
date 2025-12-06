import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

type ActivityLog = {
  keystrokes: number;
  clicks: number;
  created_at: string | Date;
};

export async function GET() {
  const hasPostgres =
    Boolean(process.env.POSTGRES_URL) ||
    Boolean(process.env.POSTGRES_URL_NON_POOLING) ||
    Boolean(process.env.POSTGRES_PRISMA_URL);

  if (!hasPostgres) {
    return NextResponse.json({ enabled: false });
  }

  try {
    const result = await sql<ActivityLog>`
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const latest = result.rows[0];

    if (!latest) {
      return NextResponse.json({ enabled: true, data: null });
    }

    const lastUpdate = new Date(latest.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    return NextResponse.json({
      enabled: true,
      data: {
        keystrokes: latest.keystrokes,
        clicks: latest.clicks,
        lastUpdate: lastUpdate.toISOString(),
        isOnline: diffMinutes < 20,
      },
    });
  } catch (error) {
    console.error("Failed to load activity_logs:", error);
    return NextResponse.json({ enabled: true, error: "DB_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const serverKey = process.env.ACTIVITY_API_KEY;

  if (!serverKey) {
    console.error("ACTIVITY_API_KEY is not configured.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== serverKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { keystrokes, clicks } = body as { keystrokes?: unknown; clicks?: unknown };

    if (typeof keystrokes !== "number" || typeof clicks !== "number") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await sql`
      INSERT INTO activity_logs (keystrokes, clicks)
      VALUES (${keystrokes}, ${clicks});
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
