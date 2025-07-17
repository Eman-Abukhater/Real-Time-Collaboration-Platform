"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
// src/config/redis.ts
const redis_1 = require("redis");
exports.redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
exports.redis.on('error', (err) => console.error('Redis error:', err));
(async () => {
    await exports.redis.connect();
})(); // top-level in entry point or async function
