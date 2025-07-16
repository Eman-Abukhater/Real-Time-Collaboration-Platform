import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message"; // ✅ Import your Message entity

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  role!: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];
}
