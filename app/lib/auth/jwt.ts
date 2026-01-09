import jwt from "jsonwebtoken";
import { AuthUser } from "./types";
import { JWT_CONFIG } from "../constants";

export function signJWT(user: AuthUser) {
  return jwt.sign(user, JWT_CONFIG.secret, {
    algorithm: "HS256",
    expiresIn: JWT_CONFIG.expiresIn,
  });
}

export function verifyJWT(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_CONFIG.secret) as AuthUser;
  } catch {
    return null;
  }
}