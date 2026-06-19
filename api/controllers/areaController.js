const prisma = require('../prisma');

exports.list = async (_req, res) => {
  const areas = await prisma.area.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } } }
  });
  const withCount = areas.map(a => ({
    ...a,
    totalMembers: a._count.members
  }));
  res.json(withCount);
};

exports.get = async (req, res) => {
  const a = await prisma.area.findUnique({ where: { id: req.params.id } });
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
};

exports.create = async (req, res) => {
  const { areaName, chairmanName } = req.body;
  const chairmanSignature = req.file ? `/uploads/${req.file.filename}` : '';
  const area = await prisma.area.create({
    data: { areaName, chairmanName, chairmanSignature }
  });
  res.status(201).json(area);
};

exports.update = async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.chairmanSignature = `/uploads/${req.file.filename}`;
  const area = await prisma.area.update({
    where: { id: req.params.id },
    data: update
  });
  res.json(area);
};

exports.remove = async (req, res) => {
  await prisma.area.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
