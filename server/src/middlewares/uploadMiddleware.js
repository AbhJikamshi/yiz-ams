import multer from "multer";
import path from "path";
import fs from "fs";

// Upload directory
const uploadDir = path.join(process.cwd(), "src", "uploads", "payment-proofs");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const filename =
      `member_${req.member.id}_${Date.now()}${ext}`;

    cb(null, filename);
  },
});

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and PDF files are allowed."
      ),
      false
    );
  }
};

// Multer upload middleware
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export default uploadMiddleware;
