const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  rollNo: { type: String, trim: true, required: true, unique: true },
  department: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // hashed
  otp: { type: String }, // store OTP temporarily
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);