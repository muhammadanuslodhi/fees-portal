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
    console.log('Create member request body:', req.body);
    // Validate required fields
    if (!req.body.memberName || !req.body.fatherName || !req.body.cnic || !req.body.areaId) {
      return res.status(400).json({ message: 'Full Name, Father Name, CNIC, and Area are required' });
    }
    
    // Check if CNIC already exists
    const existingCNIC = await prisma.member.findUnique({ where: { cnic: req.body.cnic } });
    if (existingCNIC) {
      return res.status(400).json({ message: 'CNIC already exists' });
    }
    
    // Auto generate memberId logic
    const count = await prisma.member.count();
    const nextId = 'M' + String(count + 1).padStart(5, '0');
    
    const m = await prisma.member.create({
      data: {
        memberName: req.body.memberName,
        fatherName: req.body.fatherName,
        cnic: req.body.cnic,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        phoneNo: req.body.phoneNo,
        address: req.body.address,
        areaId: req.body.areaId,
        memberId: nextId
      }
    });
    res.status(201).json(m);
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === 'P2002') { // Unique constraint failed
      return res.status(400).json({ message: 'CNIC already exists' });
    }
    // Return detailed error in development
    res.status(500).json({ 
      message: 'Error creating member', 
      error: error.message,
      code: error.code
    });
  }
};

exports.update = async (req, res) => {
  try {
    console.log('Update member request body:', req.body);
    // Check if CNIC is being updated, and if it's unique
    if (req.body.cnic) {
      const existingCNIC = await prisma.member.findFirst({
        where: {
          cnic: req.body.cnic,
          NOT: { id: req.params.id }
        }
      });
      if (existingCNIC) {
        return res.status(400).json({ message: 'CNIC already exists' });
      }
    }
    
    const m = await prisma.member.update({
      where: { id: req.params.id },
      data: {
        memberName: req.body.memberName,
        fatherName: req.body.fatherName,
        cnic: req.body.cnic,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        phoneNo: req.body.phoneNo,
        address: req.body.address,
        areaId: req.body.areaId
      }
    });
    res.json(m);
  } catch (error) {
    console.error('Error updating member:', error);
    if (error.code === 'P2002') { // Unique constraint failed
      return res.status(400).json({ message: 'CNIC already exists' });
    }
    res.status(500).json({ 
      message: 'Error updating member', 
      error: error.message,
      code: error.code
    });
  }
};

exports.remove = async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
