import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "../entities/UserEntity"; // ✅ Correct

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.messages)
  sender!: User;
}
