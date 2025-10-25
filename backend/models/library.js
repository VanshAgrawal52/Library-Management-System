const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Library name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  contactPersonName: {
    type: String,
    trim: true,
  },
  contactPhoneNo: {
    type: String,
    trim: true,
  },
  contactAddress: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Library', librarySchema);