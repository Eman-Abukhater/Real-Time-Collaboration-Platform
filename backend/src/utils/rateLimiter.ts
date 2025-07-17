import { redis } from "../config/redis";

export async function checkRateLimit(key: string, limit: number, seconds: number) {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, seconds);
  if (count > limit) throw new Error("Too many requests, slow down.");
}
