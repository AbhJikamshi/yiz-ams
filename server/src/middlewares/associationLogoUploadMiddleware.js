import multer from "multer";
import path from "path";
import fs from "fs";

// ===============================
// Upload Directory
// ===============================
const uploadDir = path.join(
  process.cwd(),
  "src",
  "uploads",
  "association"
);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ===============================
// Storage
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    cb(
      null,
      `association-logo-${Date.now()}${ext}`
    );
  },
});

// ===============================
// File Filter
// ===============================
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

// ===============================
// Multer Middleware
// ===============================
const associationLogoUploadMiddleware = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

export default associationLogoUploadMiddleware;