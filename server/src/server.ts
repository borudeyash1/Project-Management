import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import workspaceRoutes from "./routes/workspaces";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import clientRoutes from "./routes/clients";
import teamRoutes from "./routes/teams";
import payrollRoutes from "./routes/payroll";
import goalRoutes from "./routes/goals";
import reminderRoutes from "./routes/reminders";
import notificationRoutes from "./routes/notifications";
import trackerRoutes from "./routes/tracker";
import reportRoutes from "./routes/reports";
import aiRoutes from "./routes/ai";
import inboxRoutes from "./routes/inbox";
import adminRoutes from "./routes/admin";
import userManagementRoutes from "./routes/userManagement";
import desktopReleaseRoutes from "./routes/desktopRelease";
import homeRoutes from "./routes/home";
import plannerRoutes from "./routes/planner";
import subscriptionsRoutes from "./routes/subscriptions";
import attendanceRoutes from "./routes/attendance";
import documentationRoutes from "./routes/documentation";
import activityRoutes from "./routes/activity";
import contentRoutes from "./routes/content";
import { ensureDefaultSubscriptionPlans } from "./data/subscriptionPlans";

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://sartthi.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => req.path.startsWith("/admin/subscriptions"),
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files (fallback for local storage)
import path from 'path';
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-management", userManagementRoutes);
app.use("/api/releases", desktopReleaseRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/docs", documentationRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/content", contentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : {},
    });
  },
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(async () => {
    await ensureDefaultSubscriptionPlans();
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
