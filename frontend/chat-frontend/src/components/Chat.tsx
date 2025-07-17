import { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,

} from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import { connectSocket } from "../socket";
import { Socket } from "socket.io-client";

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

export default function Chat() {
  const userId = localStorage.getItem("userId");
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data } = useQuery(MESSAGES);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  let typingTimeout: ReturnType<typeof setTimeout>;

  const bottomRef = useRef<HTMLDivElement | null>(null); // ✅ create scroll ref

  useEffect(() => {
    if (!userId) return undefined;
    const s = connectSocket(userId);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (data) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat message", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("typing", (username: string) => {
      setTypingUser(`${username} is typing...`);
      setTimeout(() => setTypingUser(null), 2000);
    });

    socket.on("stop typing", () => setTypingUser(null));
    socket.on("online users", (userIds: string[]) => setOnlineUsers(userIds));

    return () => {
      socket.off("chat message");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("online users");
    };
  }, [socket]);

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;
    socket.emit("chat message", message);
    setMessage("");
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!socket) return;

    socket.emit("typing", userId);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop typing", userId);
    }, 1500);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 700,
        mx: "auto",
        my: 5,
        borderRadius: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Chat Room
      </Typography>

      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mb: 2,
          px: 1,
        }}
      >
        {typingUser && (
          <Typography variant="body2" color="text.secondary">
            {typingUser}
          </Typography>
        )}

        {messages.map((msg) => {
          const isOnline = onlineUsers.includes(msg.sender.id);
          return (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.sender.id === userId ? "flex-end" : "flex-start",
                backgroundColor:
                  msg.sender.id === userId ? "#e3f2fd" : "#f5f5f5",
                px: 2,
                py: 1.2,
                borderRadius: 2,
                maxWidth: "80%",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="primary"
                >
                  {msg.sender.username}
                </Typography>
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: isOnline ? "green" : "gray",
                  }}
                />
              </Box>
              <Typography variant="body1">{msg.content}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </Typography>
            </Box>
          );
        })}

        {/* ✅ This is the scroll target */}
        <div ref={bottomRef} />
      </Box>

      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}