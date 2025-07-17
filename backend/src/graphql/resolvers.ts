import { User } from "../entities/UserEntity";
import { AppDataSource } from "../data-source";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireRole } from "../utils/auth";
import { Message } from "../entities/Message";

const SECRET = "supersecretkey";
const userRepo = AppDataSource.getRepository(User);

export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL 🚀",

    me: async (_: any, __: any, context: any) => {
      if (!context.user) return null;
      return await userRepo.findOneBy({ id: context.user.id });
    },

    adminSecret: (_: any, __: any, context: any) => {
      requireRole(context.user, ["Admin"]);
      return "🎉 This is top-secret admin content!";
    },
    messages: async () => {
      return await AppDataSource.getRepository(Message).find({
        relations: ["sender"],
        order: { createdAt: "ASC" }
      });
    }
  },

  Mutation: {
    register: async (_: any, { username, email, password }: any) => {
      const existing = await userRepo.findOneBy({ email });
      if (existing) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepo.create({
        username,
        email,
        password: hashedPassword,
        role: "User",
      });

      await userRepo.save(newUser);

      const token = jwt.sign({ userId: newUser.id }, SECRET, {
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

    login: async (_: any, { email, password }: any) => {
      const user = await userRepo.findOneBy({ email });
      if (!user) throw new Error("User not found");
    
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password");
    
      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
    
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
    

    uploadAvatar: async (_: any, { userId, avatarUrl }: any, context: any) => {
      if (!context.user || context.user.id !== userId) {
        throw new Error("Unauthorized");
      }

      const user = await userRepo.findOneBy({ id: userId });
      if (!user) throw new Error("User not found");

      user.avatarUrl = avatarUrl;
      await userRepo.save(user);

      return user;
    },

    
  },
};
