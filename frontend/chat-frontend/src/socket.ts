import { io } from "socket.io-client";

// Helper function to decode token
function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

const userId = getUserIdFromToken();

const socket = io("http://localhost:4000", {
  query: { userId }, 
});

export default socket;
