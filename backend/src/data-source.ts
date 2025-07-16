import { DataSource } from "typeorm";
import { User } from "./entities/UserEntity";
import { Message } from "./entities/Message";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "eman12345",
  database: "collaboration",
  synchronize: true,
  logging: true,
  entities: [User, Message],
  migrations: [],
  subscribers: [],
});
