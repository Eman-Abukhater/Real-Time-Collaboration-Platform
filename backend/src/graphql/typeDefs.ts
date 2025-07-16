import { gql } from "graphql-tag";

export const typeDefs = gql`
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

`;
