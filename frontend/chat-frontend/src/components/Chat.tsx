import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import socket from "../socket";
import { v4 as uuidv4 } from "uuid";

const MESSAGES = gql`
  query GetMessages {
    messages {
      id
      content
      createdAt
      sender {
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
      username: string;
    };
  };
  

export default function Chat() {
  const { data } = useQuery(MESSAGES);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (data) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    socket.on("chat message", (msg: string) => {

        setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              content: msg,
              sender: { username: "Someone" },
              createdAt: new Date().toISOString(),
            },
          ]);    });

    return () => {
      socket.off("chat message");
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
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <strong>{msg.sender?.username || "Anonymous"}:</strong> {msg.content}
          </Box>
        ))}
      </Box>
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}
