import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "perfectjodi_jwt_secret_super_secure_key_2026_matrimony";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "member" | "admin";
  name: string;
  hasProfile: boolean;
  profileId?: string;
}

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromToken(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pj_token")?.value;
    if (!token) return null;
    return verifyJwt(token);
  } catch {
    return null;
  }
}
