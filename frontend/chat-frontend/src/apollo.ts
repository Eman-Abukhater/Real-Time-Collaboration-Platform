import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://web-production-7432.up.railway.app/graphql",
  cache: new InMemoryCache(),
});


export default client;
