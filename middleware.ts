import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const hasAdminCredentials = Boolean(ADMIN_USER) && Boolean(ADMIN_PASSWORD);

function unauthorized() {
  const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  response.headers.set("WWW-Authenticate", 'Basic realm="Admin Dashboard"');
  return response;
}

const decodeBase64 = (value: string) => {
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString();
  }
  throw new Error("No base64 decoder available");
};

function verifyBasicAuth(header: string | null) {
  if (!hasAdminCredentials) return false;
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decoded = decodeBase64(header.replace("Basic ", ""));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;
    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return user === ADMIN_USER && password === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (!hasAdminCredentials) {
    return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
  }
  if (verifyBasicAuth(request.headers.get("authorization"))) {
    return NextResponse.next();
  }
  return unauthorized();
}

export const config = {
  matcher: ["/admin/:path*"],
};
