const prisma = require('../prisma');

exports.list = async (req, res) => {
  const { name, year } = req.query;
  const where = {};
  if (year) where.year = Number(year);
  if (name) where.name = { contains: name, mode: 'insensitive' };

  const rows = await prisma.atiya.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  });
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { name, year, amount, purpose, paid, notes } = req.body;
  const numYear = Number(year);
  const doc = await prisma.atiya.upsert({
    where: { name_year: { name, year: numYear } },
    update: { amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' },
    create: { name, year: numYear, amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.update = async (req, res) => {
  const { name, year, amount, purpose, paid, notes } = req.body;
  const doc = await prisma.atiya.update({
    where: { id: req.params.id },
    data: { name, year: Number(year), amount: Number(amount), purpose: purpose || '', paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.remove = async (req, res) => {
  await prisma.atiya.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
