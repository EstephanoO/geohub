import jwt from "jsonwebtoken";
import { AuthUser } from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signJWT(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyJWT(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}