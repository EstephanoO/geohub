import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/app/lib/auth/password";
import { signJWT } from "@/app/lib/auth/jwt";
import { AUTH_CREDENTIALS } from "@/app/lib/constants";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Verificar credenciales desde constants
  if (email !== AUTH_CREDENTIALS.email) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = verifyPassword(password, AUTH_CREDENTIALS.password);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signJWT({ email, role: "admin" });
  const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create response and set cookie properly
  const response = NextResponse.json({ ok: true, redirectTo: `/admin/map/${mapId}` });
  
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
  
  return response;
}