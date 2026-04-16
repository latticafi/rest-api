import * as jose from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable not set");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_ISSUER = "lattica";
const JWT_EXPIRATION = "24h";

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
}

export async function signJWT(walletAddress: string): Promise<string> {
  return new jose.SignJWT({ sub: walletAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
  });
  return payload as unknown as JWTPayload;
}
