const userModel = require("../models/userModel");
const teacherModel = require("../models/teacherModel");

// 📌 Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find()
      .populate("teacherId", "fullName email phone classId")
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
      .populate("teacherId", "fullName email phone classId")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Create user account for teacher (Admin only)
exports.createTeacherAccount = async (req, res) => {
  try {
    const { teacherId, email, password } = req.body;

    // Validate required fields
    if (!teacherId || !email || !password) {
      return res.status(400).json({ message: "Teacher ID, email, and password are required" });
    }

    // Check if teacher exists
    const teacher = await teacherModel.findById(teacherId).populate("classId");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if user already exists with this email
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if teacher already has an account
    const existingTeacherAccount = await userModel.findOne({ teacherId });
    if (existingTeacherAccount) {
      return res.status(400).json({ message: "This teacher already has a user account" });
    }

    // Create user account
    const user = new userModel({
      email: email.toLowerCase(),
      password,
      role: "teacher",
      teacherId,
      fullName: teacher.fullName
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Teacher account created successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Create teacher account error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Update user (Admin only, or user updating their own profile)
exports.updateUser = async (req, res) => {
  try {
    const { email, password, isActive } = req.body;
    const userId = req.params.id;
    const currentUserId = req.user.userId;

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Users can only update their own email (not password or status)
    // Admins can update anyone
    const isUpdatingSelf = userId === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isUpdatingSelf) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    // Non-admins can only update email, not password or status
    if (!isAdmin && (password || typeof isActive === 'boolean')) {
      return res.status(403).json({ message: "Only admins can change password or status" });
    }

    const updateData = {};
    if (email) updateData.email = email.toLowerCase();
    if (password && isAdmin) updateData.password = password;
    if (typeof isActive === 'boolean' && isAdmin) updateData.isActive = isActive;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId)
      .populate("teacherId", "fullName email phone classId")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Update current user's profile (special handler for /me endpoint)
exports.updateMyProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.userId;

    // Users can only update their email
    const updateData = {};
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await userModel.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      
      updateData.email = email.toLowerCase();
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get teachers without accounts
exports.getTeachersWithoutAccounts = async (req, res) => {
  try {
    const allTeachers = await teacherModel.find().populate("classId");
    const teachersWithAccounts = await userModel.find({ role: "teacher" })
      .select("teacherId");

    const teacherIdsWithAccounts = teachersWithAccounts.map(u => u.teacherId.toString());
    
    const teachersWithoutAccounts = allTeachers.filter(
      teacher => !teacherIdsWithAccounts.includes(teacher._id.toString())
    );

    res.status(200).json(teachersWithoutAccounts);
  } catch (error) {
    console.error("Get teachers without accounts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

