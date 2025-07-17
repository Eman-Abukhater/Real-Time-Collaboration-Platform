"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.typeDefs = (0, graphql_tag_1.gql) `
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    hello: String
    me: User
    adminSecret: String!
  }

  type Mutation {
  register(username: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  uploadAvatar(userId: ID!, avatarUrl: String!): User! # ✅ Add this

}
type Message {
  id: ID!
  content: String!
  createdAt: String!
  sender: User!
}

extend type Query {
  messages: [Message!]!
}


`;
