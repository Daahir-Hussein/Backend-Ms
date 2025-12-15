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
app.use(cors())

app.use(express.json())

const port = process.env.PORT || 3000;

// Connect to database
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/al_taqwa_school'
mongoose.connect(DATABASE_URL).then(() => {
    console.log("Database has Successfully Connected")
    
    // Automatic monthly progression is disabled - progression is now manual only
    // Users can progress students manually through the UI with options to:
    // - Progress all students
    // - Progress students by specific part(s)
    // - Progress specific students individually
    console.log("ℹ️  English parts progression is manual only - use the UI to progress students when needed");
}).catch((error) => console.log("Database connection error:", error))

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

app.listen(port, () => console.log(`Server is running on port ${port}`))