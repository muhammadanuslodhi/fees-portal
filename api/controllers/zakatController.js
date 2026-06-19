const prisma = require('../prisma');

exports.list = async (req, res) => {
  const { memberId, year, areaId } = req.query;
  const where = {};
  if (year) where.year = Number(year);
  if (memberId) where.memberId = memberId;
  if (areaId) where.member = { areaId };

  const rows = await prisma.zakat.findMany({
    where,
    include: { member: { include: { area: true } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { memberId, year, amount, paid, notes } = req.body;
  const numYear = Number(year);
  const doc = await prisma.zakat.upsert({
    where: { memberId_year: { memberId, year: numYear } },
    update: { amount: Number(amount), paid: !!paid, notes: notes || '' },
    create: { memberId, year: numYear, amount: Number(amount), paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.update = async (req, res) => {
  const { amount, paid, notes } = req.body;
  const doc = await prisma.zakat.update({
    where: { id: req.params.id },
    data: { amount: Number(amount), paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.remove = async (req, res) => {
  await prisma.zakat.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
