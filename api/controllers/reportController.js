const prisma = require('../prisma');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function mapFeeToMongooseFormat(doc) {
  if (!doc) return null;
  const mapped = { ...doc };
  for (const m of MONTHS) {
    mapped[m] = {
      paid: doc[`${m.toLowerCase()}Paid`],
      amount: doc[`${m.toLowerCase()}Amount`]
    };
  }
  return mapped;
}

exports.areaReport = async (req, res) => {
  const { areaId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();
  
  const area = await prisma.area.findUnique({ where: { id: areaId } });
  if (!area) return res.status(404).json({ message: 'Area not found' });
  
  const members = await prisma.member.findMany({
    where: { areaId },
    orderBy: { memberId: 'asc' }
  });
  
  const memberIds = members.map(m => m.id);
  const fees = await prisma.feeRecord.findMany({
    where: { year, memberId: { in: memberIds } }
  });
  
  const feeMap = Object.fromEntries(fees.map(f => [f.memberId, mapFeeToMongooseFormat(f)]));
  const rows = members.map(m => ({ member: m, fee: feeMap[m.id] || null }));
  
  const totalCollected = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPending = fees.reduce((s, f) => s + f.pendingAmount, 0);
  const latestUpdate = fees.reduce((d, f) => f.updatedAt > d ? f.updatedAt : d, new Date(0));
  
  res.json({
    area, year, rows,
    summary: { totalMembers: members.length, totalCollected, totalPending },
    latestUpdate,
  });
};

exports.dashboard = async (_req, res) => {
  const [totalAreas, totalMembers, fees] = await Promise.all([
    prisma.area.count(),
    prisma.member.count(),
    prisma.feeRecord.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { member: { include: { area: true } } }
    }),
  ]);
  
  const allFees = await prisma.feeRecord.findMany();
  const totalCollected = allFees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPending = allFees.reduce((s, f) => s + f.pendingAmount, 0);
  
  const mappedFees = fees.map(f => {
    const mFee = mapFeeToMongooseFormat(f);
    mFee.memberId = { ...f.member, areaId: f.member.area }; // simulate populate
    return mFee;
  });
  
  res.json({ totalAreas, totalMembers, totalCollected, totalPending, latest: mappedFees });
};

exports.search = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ areas: [], members: [] });

  try {
    const [areas, members] = await Promise.all([
      prisma.area.findMany({
        where: {
          OR: [
            { areaName: { contains: q, mode: 'insensitive' } },
            { chairmanName: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.member.findMany({
        where: {
          OR: [
            { memberName: { contains: q, mode: 'insensitive' } },
            { memberId: { contains: q, mode: 'insensitive' } },
            { fatherName: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: { area: true },
        take: 10
      })
    ]);

    // Format members areaId similar to other endpoints if needed
    const mappedMembers = members.map(m => ({
      ...m,
      areaId: m.area
    }));

    res.json({ areas, members: mappedMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};

