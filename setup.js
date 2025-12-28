const mongoose = require("mongoose");
const userModel = require("./models/userModel");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/al_taqwa_school';

async function setup() {
  try {
    // Connect to database
    await mongoose.connect(DATABASE_URL);
    console.log("Database connected");

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: "admin@altaqwa.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create default admin user
    const admin = new userModel({
      email: "admin@altaqwa.com",
      password: "admin123", // Will be hashed automatically
      role: "admin",
      fullName: "Administrator"
    });

    await admin.save();
    console.log("✅ Default admin user created:");
    console.log("   Email: admin@altaqwa.com");
    console.log("   Password: admin123");
    console.log("\n⚠️  Please change the default password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Setup error:", error);
    process.exit(1);
  }
}

setup();









