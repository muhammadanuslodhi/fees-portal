const Member = require('../models/Member');

exports.list = async (req, res) => {
  const { areaId, q, memberId } = req.query;
  const filter = {};
  if (areaId) filter.areaId = areaId;
  if (memberId) filter.memberId = new RegExp(memberId, 'i');
  if (q) filter.memberName = new RegExp(q, 'i');
  const members = await Member.find(filter).populate('areaId', 'areaName').sort({ createdAt: -1 });
  res.json(members);
};

exports.get = async (req, res) => {
  const m = await Member.findById(req.params.id).populate('areaId');
  if (!m) return res.status(404).json({ message: 'Not found' });
  res.json(m);
};

exports.create = async (req, res) => {
  const m = await Member.create(req.body);
  res.status(201).json(m);
};

exports.update = async (req, res) => {
  const m = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(m);
};

exports.remove = async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
