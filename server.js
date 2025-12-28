const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config()


// Try to load node-cron, but don't fail if it's not installed
let cron;
try {
    cron = require("node-cron");
} catch (error) {
    console.log("⚠️  node-cron not installed. Scheduled jobs will be disabled. Install with: npm install node-cron");
}

// Routes
const authRouter = require("./Routes/authRouter")
const userRouter = require("./Routes/userRouter")
const classRouter = require("./Routes/classRouter")
const studentRouter = require("./Routes/studentRouter")
const teacherRouter = require("./Routes/teacherRouter")
const attendanceRouter = require("./Routes/attendanceRouter")
const financeRouter = require("./Routes/financeRouter")
const attendanceReportRouter = require("./Routes/attendanceReportRouter")
const financeReportRouter = require("./Routes/financeReportRouter")

const app = express()

// Middleware
// CORS configuration - allow requests from frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const port = process.env.PORT || 3000;

// Connect to database
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file");
  process.exit(1);
}

mongoose.connect(DATABASE_URL).then(() => {
    console.log("✅ Database has Successfully Connected");
    
    // Automatic monthly progression is disabled - progression is now manual only
    // Users can progress students manually through the UI with options to:
    // - Progress all students
    // - Progress students by specific part(s)
    // - Progress specific students individually
    console.log("ℹ️  English parts progression is manual only - use the UI to progress students when needed");
}).catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
})

// Routes
app.use("/api/auth", authRouter)
app.use("/api", userRouter)
app.use("/", classRouter)
app.use("/", studentRouter)
app.use("/", teacherRouter)
app.use("/", attendanceRouter)
app.use("/", financeRouter)
app.use("/", attendanceReportRouter)
app.use("/",financeReportRouter)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
})