"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = require("body-parser");
const typeDefs_1 = require("./graphql/typeDefs");
const resolvers_1 = require("./graphql/resolvers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const data_source_1 = require("./data-source");
const Message_1 = require("./entities/Message");
const UserEntity_1 = require("./entities/UserEntity");
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const messageRepo = data_source_1.AppDataSource.getRepository(Message_1.Message);
const userRepo = data_source_1.AppDataSource.getRepository(UserEntity_1.User);
// Create uploads folder if not exists
const uploadsPath = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath);
}
const onlineUsers = new Map();
// Multer configuration
const storage = multer_1.default.diskStorage({
    destination: uploadsPath,
    filename: (_, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
// Serve uploaded files statically
app.use("/uploads", express_1.default.static(uploadsPath));
// Create HTTP server
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" },
});
async function startServer() {
    const server = new server_1.ApolloServer({ typeDefs: typeDefs_1.typeDefs, resolvers: resolvers_1.resolvers });
    await server.start();
    app.use((0, cors_1.default)());
    app.use((0, body_parser_1.json)());
    app.use("/graphql", (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization?.split(" ")[1];
            let user = null;
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, "supersecretkey");
                    user = await userRepo.findOneBy({ id: decoded.userId });
                }
                catch (err) {
                    user = null;
                }
            }
            return { user };
        },
    }));
    app.use("/files", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
    app.use(express_1.default.json());
    app.use("/api", fileRoutes_1.default);
    app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
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
        const userId = socket.handshake.query.userId;
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
        socket.on("typing", async (userId) => {
            const user = await userRepo.findOneBy({ id: userId });
            if (user) {
                socket.broadcast.emit("typing", user.username);
            }
        });
        socket.on("stop typing", async (userId) => {
            const user = await userRepo.findOneBy({ id: userId });
            if (user) {
                socket.broadcast.emit("stop typing");
            }
        });
        socket.on("chat message", async (rawMsg) => {
            const userId = socket.handshake.query.userId;
            if (!userId || userId === "null") {
                console.warn("Missing or invalid userId in socket connection");
                return;
            }
            const user = await userRepo.findOneBy({ id: userId });
            if (!user)
                return;
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
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log(" TypeORM Data Source has been initialized!");
    startServer();
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
