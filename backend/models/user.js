const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define requestSchema in the same file
const requestSchema = new Schema({
  email: { type: String, required: true },
  documentTitle: { type: String, required: true },
  authors: { type: String, required: true },
  publicationName: { type: String, required: true },
  publicationYear: { type: Number, required: true },
  volumeNo: { type: String, required: true },
  issueNo: { type: String },
  pageRange: { type: String },
  sourceUrl: { type: String, required: true },
  publisher: { type: String, required: true },
  status: { type: String, enum: ['processing', 'arrived', 'accepted', 'rejected', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  pdfFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }, // Reference to GridFS file
  rejectReason: { type: String }
});

const userSchema = new Schema({
  name: { type: String, trim: true, required: true },
  rollNo: { type: String, trim: true, required: true, unique: true },
  department: { type: String, trim: true, required: true },
  email: { type: String, trim: true, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  otp: { type: String },
  requests: [requestSchema], // Embed requestSchema as subdocuments
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);