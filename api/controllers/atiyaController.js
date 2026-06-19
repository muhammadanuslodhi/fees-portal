const prisma = require('../prisma');

exports.list = async (req, res) => {
  const { memberId, year, areaId } = req.query;
  const where = {};
  if (year) where.year = Number(year);
  if (memberId) where.memberId = memberId;
  if (areaId) where.member = { areaId };

  const rows = await prisma.atiya.findMany({
    where,
    include: { member: { include: { area: true } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { memberId, year, amount, purpose, paid, notes } = req.body;
  const numYear = Number(year);
  const doc = await prisma.atiya.upsert({
    where: { memberId_year: { memberId, year: numYear } },
    update: { amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' },
    create: { memberId, year: numYear, amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.update = async (req, res) => {
  const { amount, purpose, paid, notes } = req.body;
  const doc = await prisma.atiya.update({
    where: { id: req.params.id },
    data: { amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.remove = async (req, res) => {
  await prisma.atiya.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
