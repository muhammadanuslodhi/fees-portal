const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set!");
    console.log("\nPlease run the script with your DATABASE_URL:");
    console.log("On PowerShell: $env:DATABASE_URL=\"your_postgres_connection_string\"; node api/seed/update-password.js");
    console.log("On Git Bash/Linux: DATABASE_URL=\"your_postgres_connection_string\" node api/seed/update-password.js\n");
    process.exit(1);
  }

  const password = 'profit786@$%';
  const hashed = await bcrypt.hash(password, 10);
  await prisma.admin.update({
    where: { username: 'admin' },
    data: { password: hashed }
  });
  console.log('Admin password updated successfully to: ' + password);
}

main()
  .catch(e => {
    console.error("Database connection error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {}
  });
