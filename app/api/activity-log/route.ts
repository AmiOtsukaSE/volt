import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

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
