import "./config/env";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import passport from 'passport';
import path from 'path';
import disconnectModulesRoutes from "./routes/disconnect-modules";

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
import sartthiAuthRoutes from "./routes/sartthi-auth";
import sartthiMailRoutes from "./routes/sartthi-mail";
import sartthiCalendarRoutes from "./routes/sartthi-calendar";
import sartthiVaultRoutes from "./routes/sartthi-vault";
import vaultWorkspaceRoutes from "./routes/vaultWorkspace";
import sartthiRoutes from "./routes/sartthiRoutes";
import { ensureDefaultSubscriptionPlans } from "./data/subscriptionPlans";
import { initializeSartthiServices } from "./services/sartthi/sartthiConfig";

// Load environment variables
// Environment variables loaded in ./config/env
// dotenv.config({ path: "./.env" });

const app = express();

// Security middleware
app.use(helmet());
app.set('trust proxy', 1); // Trust first proxy

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://sartthi.com',
    'https://www.sartthi.com',
    'https://mail.sartthi.com',
    'https://calendar.sartthi.com',
    'https://vault.sartthi.com',
    'https://drive.sartthi.com',
  ]
  : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => req.path.startsWith("/admin/subscriptions"),
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: true, limit: "1gb" }));

// Initialize Passport
app.use(passport.initialize());

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('📁 [SERVER] Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/sartthi", sartthiAuthRoutes);
app.use("/api/mail", sartthiMailRoutes);
app.use("/api/calendar", sartthiCalendarRoutes);
app.use("/api/vault", sartthiVaultRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth/sartthi", sartthiAuthRoutes);
app.use("/api/auth/sartthi", disconnectModulesRoutes); // ADD THIS LINE
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
app.use("/api/docs", documentationRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/sartthi", sartthiRoutes);

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
    initializeSartthiServices();
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Increase timeout to 10 minutes for large file uploads
server.setTimeout(10 * 60 * 1000);

export default app;
