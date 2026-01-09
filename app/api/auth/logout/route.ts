import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: "/admin/login" });
  
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // Delete cookie
  });
  
  return response;
}