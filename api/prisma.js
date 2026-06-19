const { PrismaClient } = require('@prisma/client');

// Ensure we don't create multiple instances in Vercel serverless environment
let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

prisma = global.prisma;

module.exports = prisma;
