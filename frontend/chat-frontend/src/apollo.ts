import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // Update if backend is hosted elsewhere
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export default client;
