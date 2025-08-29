import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import database from './config/database';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext, GraphQLContext } from './graphql/context';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000');

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  csrfPrevention: false, // Disable CSRF protection for development
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    };
  }
});

// Start Apollo Server
async function startServer() {
  try {
    await database.connect();
    
    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: createContext
    });
    
    console.log(`🚀 GraphQL server running on ${url}`);
    console.log(`📊 GraphQL Playground available at ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});
