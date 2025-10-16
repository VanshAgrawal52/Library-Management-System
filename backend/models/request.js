const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
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
  metaId: { type: String },
  status: { type: String, enum: ['processing', 'arrived', 'accepted', 'rejected', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  pdfFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }, // Reference to GridFS file
  rejectReason: { type: String }
}); 

module.exports = mongoose.model('Request', requestSchema);