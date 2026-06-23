const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

async function main() {
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
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
