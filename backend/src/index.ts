import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello.resolver';

async function test() {
  // Build schema with just the hello resolver
  const schema = await buildSchema({
    resolvers: [HelloResolver],
  });

  // Create and start server
  const server = new ApolloServer({ schema });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  });

  console.log(`Test server running at ${url}`);
}

test().catch(console.error);