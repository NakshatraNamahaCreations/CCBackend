const Admin = require('../models/account.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Register an admin user
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, username, phonenumber, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !username || !phonenumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username, phone number, password, and role are required',
      });
    }

    // Check if email or username already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists',
      });
    }

    // Create new admin user (role comes from frontend)
    const admin = new Admin({
      name,
      email,
      username,
      phonenumber,
      password, // Password will be hashed by pre-save hook
      role,     // ✅ take role from frontend
      status: 'active',
    });

    await admin.save();

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        phonenumber: admin.phonenumber,
        role: admin.role,
        status: admin.status,
      },
      message: 'Admin registered successfully',
    });
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register admin',
    });
  }
};


// Login an admin user
exports.loginAdmin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and password are required" });
    }

    const admin = await Admin.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    });

    if (!admin) return res.status(400).json({ success: false, message: "Invalid credentials" });
    if (admin.status !== "active") return res.status(403).json({ success: false, message: "Account is inactive. Contact administrator." });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (e) {
    console.error("Admin login error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Fetch all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password"); // exclude password
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching admins",
    });
  }
};

// ✅ Fetch one admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Delete admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while deleting admin",
    });
  }
};

// ✅ Toggle active/inactive status
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Flip status
    admin.status = admin.status === "active" ? "inactive" : "active";
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin status updated to ${admin.status}`,
      data: { id: admin._id, status: admin.status },
    });
  } catch (error) {
    console.error("Toggle Admin Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while toggling status",
    });
  }
};
