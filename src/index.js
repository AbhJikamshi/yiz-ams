import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import memberRoutes from "./routes/memberRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
// Middlewares
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// ===========================
// Global Middlewares
// ===========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// Root Route
// ===========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 YIZ-AMS Backend is Running!",
    version: "1.0.0",
    status: "OK",
  });
});

// ===========================
// API Routes
// ===========================
app.use("/api/admin", adminRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);

// ===========================
// Error Handling
// ===========================
app.use(notFound);
app.use(errorHandler);

// ===========================
// Server
// ===========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});