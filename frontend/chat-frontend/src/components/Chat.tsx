import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import socket from "../socket";
let typingTimeout: ReturnType<typeof setTimeout>;

const MESSAGES = gql`
  query GetMessages {
    messages {
      id
      content
      createdAt
      sender {
        id
        username
      }
    }
  }
`;
type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
};
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

export default function Chat() {
  const { data } = useQuery(MESSAGES);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (data) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("chat message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("stop typing", () => {
      setTypingUser(null);
    });
    socket.on("online users", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    // ✅ Listen for typing event
    socket.on("typing", (username: string) => {
      setTypingUser(`${username} is typing...`);
      setTimeout(() => setTypingUser(null), 2000);
    });
    if (userId) {
      socket.emit("userOnline", userId);
    }

    return () => {
      socket.off("chat message");
      socket.off("typing");
      socket.off("stop typing");
      clearTimeout(typingTimeout);
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit("chat message", message);
      setMessage("");
    }
  };

  return (
    <Paper sx={{ p: 2, maxWidth: 600, margin: "0 auto", mt: 4 }}>
      <Typography variant="h5">Chat Room</Typography>
      <Box sx={{ maxHeight: 400, overflowY: "auto", my: 2 }}>
        {typingUser && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {typingUser}
          </Typography>
        )}

        {messages.map((msg, index) => {
          const isOnline = onlineUsers.includes(msg.sender.id);

          return (
            <Box key={index} sx={{ mb: 1 }}>
              <strong>
                {msg.sender?.username}{" "}
                <span
                  style={{
                    color: isOnline ? "green" : "gray",
                    fontSize: "0.8em",
                  }}
                >
                  ● {isOnline ? "online" : "offline"}
                </span>
              </strong>
              : {msg.content}
            </Box>
          );
        })}
      </Box>
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (userId) socket.emit("typing", userId);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
              if (userId) socket.emit("stop typing", userId);
            }, 1500);
          }}
          placeholder="Type a message"
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}
