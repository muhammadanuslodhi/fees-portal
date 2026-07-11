const prisma = require('../prisma');

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
  try {
    // Validate required fields
    if (!req.body.memberName || !req.body.fatherName || !req.body.areaId) {
      return res.status(400).json({ message: 'Full Name, Father Name, and Area are required' });
    }
    
    // Check if CNIC already exists (only if cnic provided)
    if (req.body.cnic) {
      const existingCNIC = await prisma.member.findUnique({ where: { cnic: req.body.cnic } });
      if (existingCNIC) {
        return res.status(400).json({ message: 'A member with this CNIC already exists' });
      }
    }

    // Verify area exists
    const area = await prisma.area.findUnique({ where: { id: req.body.areaId } });
    if (!area) {
      return res.status(400).json({ message: 'Selected area not found. Please select a valid area.' });
    }
    
    // Auto generate memberId — find max and increment to avoid collision after deletions
    const lastMember = await prisma.member.findFirst({ orderBy: { createdAt: 'desc' } });
    let nextNum = 1;
    if (lastMember && lastMember.memberId) {
      const match = lastMember.memberId.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const nextId = 'M' + String(nextNum).padStart(5, '0');
    
    const m = await prisma.member.create({
      data: {
        memberName: req.body.memberName,
        fatherName: req.body.fatherName,
        cnic: req.body.cnic || null,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        phoneNo: req.body.phoneNo || null,
        address: req.body.address || null,
        areaId: req.body.areaId,
        memberId: nextId
      },
      include: { area: true }
    });
    res.status(201).json({ ...m, areaId: m.area });
  } catch (error) {
    console.error('Create member error:', error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.includes('cnic') ? 'CNIC' : 'Member ID';
      return res.status(400).json({ message: `${field} already exists. Please use a different value.` });
    }
    if (error.code === 'P2003' || error.code === 'P2025') {
      return res.status(400).json({ message: 'Selected area does not exist. Please refresh and try again.' });
    }
    if (error.name === 'PrismaClientInitializationError' || error.name === 'PrismaClientKnownRequestError') {
      return res.status(503).json({ message: 'Database connection failed. Please check server configuration.' });
    }
    res.status(500).json({ message: error.message || 'Failed to create member. Please try again.' });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.memberName || !req.body.fatherName || !req.body.areaId) {
      return res.status(400).json({ message: 'Full Name, Father Name, and Area are required' });
    }

    // Check CNIC uniqueness if provided
    if (req.body.cnic) {
      const existingCNIC = await prisma.member.findFirst({
        where: {
          cnic: req.body.cnic,
          NOT: { id: req.params.id }
        }
      });
      if (existingCNIC) {
        return res.status(400).json({ message: 'A member with this CNIC already exists' });
      }
    }
    
    const m = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        memberName: req.body.memberName,
        fatherName: req.body.fatherName,
        cnic: req.body.cnic || null,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        phoneNo: req.body.phoneNo || null,
        address: req.body.address || null,
        areaId: req.body.areaId
      },
      include: { area: true }
    });
    res.json({ ...m, areaId: m.area });
  } catch (error) {
    console.error('Update member error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'CNIC already exists. Please use a different value.' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Member not found.' });
    }
    res.status(500).json({ message: error.message || 'Failed to update member. Please try again.' });
  }
};

exports.remove = async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
