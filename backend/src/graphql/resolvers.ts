import { users, User } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { requireRole } from "../utils/auth";

const SECRET = "supersecretkey"; // later from .env

export const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL 🚀",
    me: (_: any, __: any, context: any) => {
      return context.user || null;
    },
    adminSecret: (_: any, __: any, context: any) => {
        requireRole(context.user, ["Admin"]); //Only Admins allowed
        return "🎉 This is top-secret admin content!";
      }
  },

  Mutation: {
    register: async (_: any, { username, email, password }: any) => {
      const existing = users.find(u => u.email === email);
      if (existing) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        role: "User"
      };

      users.push(newUser);

      const token = jwt.sign({ userId: newUser.id }, SECRET, { expiresIn: "1d" });

      return {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      };
    },

    login: async (_: any, { email, password }: any) => {
      const user = users.find(u => u.email === email);
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
          role: user.role
        }
      };
    }
  }
};
