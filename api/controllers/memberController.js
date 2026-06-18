const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { areaId, q, memberId } = req.query;
  const where = {};
  if (areaId) where.areaId = areaId;
  if (memberId) where.memberId = { contains: memberId, mode: 'insensitive' };
  if (q) where.memberName = { contains: q, mode: 'insensitive' };
  
  const members = await prisma.member.findMany({
    where,
    include: { area: { select: { areaName: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  // map area relation to areaId object to match old Mongoose populate format
  const mapped = members.map(m => ({
    ...m,
    areaId: m.area
  }));
  res.json(mapped);
};

exports.get = async (req, res) => {
  const m = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: { area: true }
  });
  if (!m) return res.status(404).json({ message: 'Not found' });
  const mapped = { ...m, areaId: m.area };
  res.json(mapped);
};

exports.create = async (req, res) => {
  // auto generate memberId logic
  const count = await prisma.member.count();
  const nextId = 'M' + String(count + 1).padStart(5, '0');
  
  const m = await prisma.member.create({
    data: {
      ...req.body,
      memberId: nextId
    }
  });
  res.status(201).json(m);
};

exports.update = async (req, res) => {
  const m = await prisma.member.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(m);
};

exports.remove = async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
