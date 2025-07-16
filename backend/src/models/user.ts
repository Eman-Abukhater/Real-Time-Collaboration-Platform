export type UserRole = "Admin" | "User" | "Guest";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string; 
}

export const users: User[] = [];
