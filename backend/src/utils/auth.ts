import { User } from "../models/user";

export function requireRole(user: User | null, roles: string[]) {
  if (!user) throw new Error("Authentication required");

  if (!roles.includes(user.role)) {
    throw new Error(`Access denied for role: ${user.role}`);
  }
}
