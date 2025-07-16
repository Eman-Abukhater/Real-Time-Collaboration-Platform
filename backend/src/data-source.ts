import { DataSource } from "typeorm";
import { User } from "./models/UserEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "eman12345", 
  database: "collaboration",
  synchronize: true,
  logging: true,
  entities: [User],
  migrations: [],
  subscribers: [],
});
