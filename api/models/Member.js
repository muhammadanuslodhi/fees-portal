const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, index: true },
  memberName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
}, { timestamps: true });

MemberSchema.pre('validate', async function (next) {
  if (this.memberId) return next();
  const count = await mongoose.model('Member').countDocuments();
  this.memberId = 'M' + String(count + 1).padStart(5, '0');
  next();
});

module.exports = mongoose.model('Member', MemberSchema);
