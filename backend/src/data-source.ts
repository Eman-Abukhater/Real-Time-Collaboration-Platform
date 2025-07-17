import { DataSource } from "typeorm";
import { User } from "./entities/UserEntity";
import { Message } from "./entities/Message";
import * as dotenv from "dotenv";

dotenv.config(); // Load .env file

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Message],
  migrations: [],
  subscribers: [],
});
