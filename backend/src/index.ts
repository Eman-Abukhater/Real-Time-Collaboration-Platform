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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use(json());
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
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
