const { PrismaClient } = require('@prisma/client');

// Ensure DATABASE_URL is set before creating the client
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please add it to your Vercel project environment variables.'
  );
}

// Ensure we don't create multiple instances in Vercel serverless environment
if (!global.prisma) {
  global.prisma = new PrismaClient();
}

const prisma = global.prisma;

module.exports = prisma;
