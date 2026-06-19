import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  console.log("Testing connection...");
  const count = await prisma.admin.count();
  console.log("Count:", count);
}
main();
