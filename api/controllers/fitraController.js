const prisma = require('../prisma');

exports.list = async (req, res) => {
  const { name, year } = req.query;
  const where = {};
  if (year) where.year = Number(year);
  if (name) where.name = { contains: name, mode: 'insensitive' };

  const rows = await prisma.fitra.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  });
  res.json(rows);
};

exports.upsert = async (req, res) => {
  const { name, year, persons, amountPerPerson, paid, notes } = req.body;
  const numYear = Number(year);
  const numPersons = Number(persons) || 1;
  const numAmount = Number(amountPerPerson) || 0;
  const total = numPersons * numAmount;

  const doc = await prisma.fitra.upsert({
    where: { name_year: { name, year: numYear } },
    update: { persons: numPersons, amountPerPerson: numAmount, totalAmount: total, paid: !!paid, notes: notes || '' },
    create: { name, year: numYear, persons: numPersons, amountPerPerson: numAmount, totalAmount: total, paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.update = async (req, res) => {
  const { name, year, persons, amountPerPerson, paid, notes } = req.body;
  const numYear = Number(year);
  const numPersons = Number(persons) || 1;
  const numAmount = Number(amountPerPerson) || 0;
  const doc = await prisma.fitra.update({
    where: { id: req.params.id },
    data: { name, year: numYear, persons: numPersons, amountPerPerson: numAmount, totalAmount: numPersons * numAmount, paid: !!paid, notes: notes || '' }
  });
  res.json(doc);
};

exports.remove = async (req, res) => {
  await prisma.fitra.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
