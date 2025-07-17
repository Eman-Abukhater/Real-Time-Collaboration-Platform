"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
const redis_1 = require("../config/redis");
async function checkRateLimit(key, limit, seconds) {
    const count = await redis_1.redis.incr(key);
    if (count === 1)
        await redis_1.redis.expire(key, seconds);
    if (count > limit)
        throw new Error("Too many requests, slow down.");
}
