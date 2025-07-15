export interface User {
    id: string;
    username: string;
    email: string;
    password: string; // hashed
    role: "Admin" | "User" | "Guest";
  }
  
  export const users: User[] = [];
  