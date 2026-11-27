import { getCurrentUserFromToken, verifyJwt, type TokenPayload } from "@/lib/jwt";

/**
 * Reusable helper to extract and verify authenticated user from cookies or Authorization header.
 */
export async function getAuthUser(req?: Request): Promise<TokenPayload | null> {
  // 1. Try reading HTTP-only cookie
  let payload = await getCurrentUserFromToken();
  if (payload) return payload;

  // 2. Try Authorization Bearer header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      payload = verifyJwt(authHeader.substring(7));
      if (payload) return payload;
    }
  }

  return null;
}
