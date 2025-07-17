"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const UserEntity_1 = require("../entities/UserEntity");
const data_source_1 = require("../data-source");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../utils/auth");
const Message_1 = require("../entities/Message");
const rateLimiter_1 = require("../utils/rateLimiter");
const SECRET = "supersecretkey";
const userRepo = data_source_1.AppDataSource.getRepository(UserEntity_1.User);
exports.resolvers = {
    Query: {
        hello: () => "Hello from GraphQL 🚀",
        me: async (_, __, context) => {
            if (!context.user)
                return null;
            return await userRepo.findOneBy({ id: context.user.id });
        },
        adminSecret: (_, __, context) => {
            (0, auth_1.requireRole)(context.user, ["Admin"]);
            return "🎉 This is top-secret admin content!";
        },
        messages: async () => {
            return await data_source_1.AppDataSource.getRepository(Message_1.Message).find({
                relations: ["sender"],
                order: { createdAt: "ASC" }
            });
        }
    },
    Mutation: {
        register: async (_, { username, email, password }) => {
            const existing = await userRepo.findOneBy({ email });
            if (existing)
                throw new Error("User already exists");
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = userRepo.create({
                username,
                email,
                password: hashedPassword,
                role: "User",
            });
            await userRepo.save(newUser);
            const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, SECRET, {
                expiresIn: "1d",
            });
            return {
                token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                },
            };
        },
        login: async (_, { email, password }) => {
            await (0, rateLimiter_1.checkRateLimit)(`login:${email}`, 5, 60); // ⏱️ max 5 logins per 60 seconds
            const user = await userRepo.findOneBy({ email });
            if (!user)
                throw new Error("User not found");
            const valid = await bcryptjs_1.default.compare(password, user.password);
            if (!valid)
                throw new Error("Invalid password");
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            };
        },
        uploadAvatar: async (_, { userId, avatarUrl }, context) => {
            if (!context.user || context.user.id !== userId) {
                throw new Error("Unauthorized");
            }
            const user = await userRepo.findOneBy({ id: userId });
            if (!user)
                throw new Error("User not found");
            user.avatarUrl = avatarUrl;
            await userRepo.save(user);
            return user;
        },
    },
};
