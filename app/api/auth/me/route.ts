import { NextResponse } from "next/server";
import { verifyJWT } from "@/src/auth/jwt";

export async function GET(req: Request) {
  // Get token from cookies instead of headers
  const cookieHeader = req.headers.get("cookie");
  const tokenMatch = cookieHeader?.match(/auth_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  
  if (!token) return NextResponse.json({ user: null });

  const user = verifyJWT(token);
  return NextResponse.json({ user });
}