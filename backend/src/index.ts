import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import jwt from "jsonwebtoken";
import { users } from "./models/user";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server to bind Socket.IO + Express
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });
  
  const upload = multer({ storage });
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use(json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


  app.use("/graphql", expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1];
      let user = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, "supersecretkey") as { userId: string };
          user = users.find(u => u.id === decoded.userId) || null;
        } catch (err) {
          user = null;
        }
      }

      return { user };
    }
  }));
    
      


  // Socket.IO logic
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
  
    console.log(`🟢 User ${userId} connected with socket ID: ${socket.id}`);
  
    // Notify others that this user is online
    socket.broadcast.emit("user-online", userId);
  
    // Typing indicator handler
    socket.on("typing", (fromUserId) => {
        console.log(`✍️ Received typing from ${fromUserId}`);
        socket.broadcast.emit("typing", fromUserId);
      });
      
  
    socket.on("disconnect", () => {
      console.log(`🔴 User ${userId} disconnected`);
      socket.broadcast.emit("user-offline", userId);
    });
  });
     // Serve static files from the uploads directory
     app.post("/upload", upload.single("file"), (req, res) => {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
      
        return res.status(200).json({
          message: "File uploaded successfully",
          filename: req.file.filename,
          path: `/uploads/${req.file.filename}`,
        });
      });
      
  

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`GraphQL: http://localhost:${PORT}/graphql`);
    console.log(`Socket.IO running on port ${PORT}`);
  });
}

startServer();
