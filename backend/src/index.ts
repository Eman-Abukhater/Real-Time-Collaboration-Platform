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
import fs from "fs";
import { AppDataSource } from "./data-source";
import { Message } from "./entities/Message";
import { User } from "./entities/UserEntity";
import fileRoutes from "./routes/fileRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const messageRepo = AppDataSource.getRepository(Message);
const userRepo = AppDataSource.getRepository(User);

// Create uploads folder if not exists
const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
const onlineUsers = new Map<string, string>();
// Multer configuration
const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsPath));

// Create HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use(json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(" ")[1];
        let user = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, "supersecretkey") as {
              userId: string;
            };
            user = await userRepo.findOneBy({ id: decoded.userId });
          } catch (err) {
            user = null;
          }
        }

        return { user };
      },
    })
  );
  app.use("/files", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use("/api", fileRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({
    message: "File uploaded successfully",
    avatarUrl: `/uploads/${req.file.filename}`,
  });
});


  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    if (!userId) {
      console.log("Missing userId in connection");
      return;
    }
    socket.broadcast.emit("user-online", userId);
    onlineUsers.set(userId, socket.id);
    console.log(`${userId} connected`);

    // Notify all clients of updated online users
    io.emit("online users", Array.from(onlineUsers.keys()));

    socket.on("typing", async (userId: string) => {
      const user = await userRepo.findOneBy({ id: userId });
      if (user) {
        socket.broadcast.emit("typing", user.username);
      }
    });
    socket.on("stop typing", async (userId: string) => {
      const user = await userRepo.findOneBy({ id: userId });
      if (user) {
        socket.broadcast.emit("stop typing");
      }
    });

    socket.on("chat message", async (rawMsg: string) => {
      const userId = socket.handshake.query.userId as string;

      if (!userId || userId === "null") {
        console.warn("Missing or invalid userId in socket connection");
        return;
      }

      const user = await userRepo.findOneBy({ id: userId });
      if (!user) return;

      const msg = messageRepo.create({
        content: rawMsg,
        sender: user,
      });

      await messageRepo.save(msg);

      io.emit("chat message", {
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
          username: user.username,
        },
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`${userId} disconnected`);
      io.emit("online users", Array.from(onlineUsers.keys()));
    });
  });

  httpServer.listen(PORT, () => {
    console.log(` GraphQL ready at http://localhost:${PORT}/graphql`);
    console.log(` Socket.IO running on port ${PORT}`);
  });
}

// FIRST initialize database THEN start server
AppDataSource.initialize()
  .then(() => {
    console.log(" TypeORM Data Source has been initialized!");
    startServer();
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
