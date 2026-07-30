import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import memberRoutes from "./routes/memberRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// ===============================
// Middlewares
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Routes
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 YIZ-AMS Backend is Running!",
    version: "1.0.0",
    status: "OK",
  });
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
  });
});

// Authentication Routes
app.use("/api/admin", adminRoutes);

// Member Routes
app.use("/api/members", memberRoutes);

// ===============================
// 404 Handler
// ===============================
app.use(notFound);

// ===============================
// Global Error Handler
// ===============================
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});