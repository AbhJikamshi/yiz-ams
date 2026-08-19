import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

//UI


// Routes
import memberRoutes from "./routes/memberRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import memberAuthRoutes from "./routes/memberAuthRoutes.js";
import memberDashboardRoutes from "./routes/memberDashboardRoutes.js";
import memberPaymentRoutes from "./routes/memberPaymentRoutes.js";
import paymentRequestRoutes from "./routes/paymentRequestRoutes.js";
import memberStatementRoutes from "./routes/memberStatementRoutes.js";
import memberNotificationRoutes from "./routes/memberNotificationRoutes.js";
import memberProfileRoutes from "./routes/memberProfileRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
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
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "src/uploads")
  )
);
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
app.use("/api/member-auth", memberAuthRoutes);
app.use("/api/member/dashboard", memberDashboardRoutes);
app.use("/api/member/profile", memberProfileRoutes);
app.use("/api/member", memberPaymentRoutes);
app.use("/api", paymentRequestRoutes);
app.use("/api/member", memberStatementRoutes);
app.use("/api/member", memberNotificationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api", uploadRoutes);
//app.use("/api/notifications", notificationRoutes);


// ===========================
// Error Handling
// ===========================
app.use(notFound);
app.use(errorHandler);

// ===========================
// Server
// ===========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});