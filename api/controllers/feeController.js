const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function extractFeeData(reqBody) {
  const data = {};
  for (const m of MONTHS) {
    if (reqBody[m]) {
      data[`${m.toLowerCase()}Paid`] = !!reqBody[m].paid;
      data[`${m.toLowerCase()}Amount`] = Number(reqBody[m].amount || 0);
    }
  }
  return data;
}

function computeTotals(doc) {
  let total = 0, pending = 0;
  for (const m of MONTHS) {
    const paid = doc[`${m.toLowerCase()}Paid`];
    const amount = doc[`${m.toLowerCase()}Amount`];
    if (paid) total += Number(amount || 0);
    else pending += Number(amount || 0);
  }
  return { totalAmount: total, pendingAmount: pending };
}

function mapToMongooseFormat(doc) {
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

exports.list = async (req, res) => {
  const { memberId, year } = req.query;
  const where = {};
  if (memberId) where.memberId = memberId;
  if (year) where.year = Number(year);
  
  const rows = await prisma.feeRecord.findMany({ where });
  res.json(rows.map(mapToMongooseFormat));
};

exports.upsert = async (req, res) => {
  const { memberId, year } = req.body;
  const numYear = Number(year);
  
  let doc = await prisma.feeRecord.findUnique({
    where: { memberId_year: { memberId, year: numYear } }
  });
  
  const incoming = extractFeeData(req.body);
  const combined = { ...doc, ...incoming };
  const totals = computeTotals(combined);
  
  doc = await prisma.feeRecord.upsert({
    where: { memberId_year: { memberId, year: numYear } },
    update: { ...incoming, ...totals },
    create: { memberId, year: numYear, ...incoming, ...totals }
  });
  
  res.json(mapToMongooseFormat(doc));
};

exports.update = async (req, res) => {
  const existing = await prisma.feeRecord.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  
  const incoming = extractFeeData(req.body);
  const combined = { ...existing, ...incoming };
  const totals = computeTotals(combined);
  
  const doc = await prisma.feeRecord.update({
    where: { id: req.params.id },
    data: { ...incoming, ...totals }
  });
  res.json(mapToMongooseFormat(doc));
};
