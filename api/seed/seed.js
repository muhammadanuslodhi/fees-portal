require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

(async () => {
  console.log('Connected. Seeding...');

  await prisma.feeRecord.deleteMany();
  await prisma.member.deleteMany();
  await prisma.area.deleteMany();
  await prisma.admin.deleteMany();

  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({ data: { username: 'admin', password: hashed } });

  const area1 = await prisma.area.create({ data: { areaName: 'Green Valley', chairmanName: 'Mr. John Smith' } });
  const area2 = await prisma.area.create({ data: { areaName: 'Sunrise Heights', chairmanName: 'Mr. David Lee' } });

  const members = [
    await prisma.member.create({ data: { memberId: 'M00001', memberName: 'Ali Khan', fatherName: 'Ahmed Khan', areaId: area1.id } }),
    await prisma.member.create({ data: { memberId: 'M00002', memberName: 'Sara Ahmed', fatherName: 'Imran Ahmed', areaId: area1.id } }),
    await prisma.member.create({ data: { memberId: 'M00003', memberName: 'Bilal Raza', fatherName: 'Zafar Raza', areaId: area2.id } }),
  ];

  const year = new Date().getFullYear();
  for (const m of members) {
    let total = 0, pending = 0;
    const feeData = { memberId: m.id, year };
    
    MONTHS.forEach((mn, i) => {
      const paid = i % 2 === 0;
      const amount = 500;
      feeData[`${mn.toLowerCase()}Paid`] = paid;
      feeData[`${mn.toLowerCase()}Amount`] = amount;
      if (paid) total += amount; else pending += amount;
    });
    
    feeData.totalAmount = total;
    feeData.pendingAmount = pending;
    await prisma.feeRecord.create({ data: feeData });
  }

  console.log('Seed complete. Admin -> admin / admin123');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
