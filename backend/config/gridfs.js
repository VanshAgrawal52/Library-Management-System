const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/libraryx';

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
  console.log('GridFS connected successfully');
});

conn.on('error', (err) => {
  console.error('GridFS connection error:', err);
});

// Use the MongoDB connection URL for the storage driver. This lets the
// multer-gridfs-storage manage its own connection and ensures it creates the
// file document correctly (including the generated _id). Passing the raw
// mongoose connection object can lead to incompatibilities depending on the
// driver version.
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => ({
    filename: `${Date.now()}_${file.originalname}`,
    bucketName: 'uploads',
    contentType: file.mimetype,
  }),
});



const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Provide a memory storage multer instance for routes that want to handle
// GridFS writes manually (recommended over multer-gridfs-storage which can
// be incompatible with newer mongodb driver versions).
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

const multerErrorHandler = (err, req, res, next) => {
  console.log('Multer error:', err); // Debug
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = { upload, memoryUpload, gfs, multerErrorHandler };