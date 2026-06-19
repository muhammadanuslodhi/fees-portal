const prisma = require('../prisma');

exports.list = async (req, res) => {
  const { name, year } = req.query;
  const where = {};
  if (year) where.year = Number(year);
  if (name) where.name = { contains: name, mode: 'insensitive' };

  const rows = await prisma.zakat.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  });
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { name, year, amount, paid, notes } = req.body;
  const numYear = Number(year);
  const doc = await prisma.zakat.upsert({
    where: { name_year: { name, year: numYear } },
    update: { amount: Number(amount), paid: !!paid, notes: notes || '' },
    create: { name, year: numYear, amount: Number(amount), paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.update = async (req, res) => {
  const { name, year, amount, paid, notes } = req.body;
  const doc = await prisma.zakat.update({
    where: { id: req.params.id },
    data: { name, year: Number(year), amount: Number(amount), paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.remove = async (req, res) => {
  await prisma.zakat.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
