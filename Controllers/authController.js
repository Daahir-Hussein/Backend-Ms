const userModel = require("../models/userModel");
const teacherModel = require("../models/teacherModel");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: "7d" }
  );
};

// 📌 Register/Create User (Admin only in production)
exports.register = async (req, res) => {
  try {
    const { email, password, role, teacherId, fullName } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // If teacher, verify teacher exists
    if (role === "teacher" && teacherId) {
      const teacher = await teacherModel.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
    }

    // Create user
    const user = new userModel({
      email,
      password,
      role,
      teacherId: role === "teacher" ? teacherId : undefined,
      fullName
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email }).populate("teacherId", "fullName email phone classId");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Verify role matches
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. This account is for ${user.role}s only` });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Prepare user data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.fullName,
      teacherId: user.role === "teacher" && user.teacherId 
        ? (user.teacherId._id || user.teacherId)
        : null,
      classId: user.role === "teacher" && user.teacherId?.classId 
        ? (user.teacherId.classId._id || user.teacherId.classId)
        : null
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId)
      .populate("teacherId", "fullName email phone classId")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.fullName,
      teacherId: user.role === "teacher" && user.teacherId 
        ? (user.teacherId._id || user.teacherId)
        : null,
      classId: user.role === "teacher" && user.teacherId?.classId 
        ? (user.teacherId.classId._id || user.teacherId.classId)
        : null
    };

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
