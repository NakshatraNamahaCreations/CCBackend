const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register an admin user
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, username, phonenumber, password } = req.body;

    // Validate required fields
    if (!name || !email || !username || !phonenumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username, phone number, and password are required',
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

    // Create new admin user
    const admin = new Admin({
      name,
      email,
      username,
      phonenumber,
      password, // Password will be hashed by the pre-save hook in the Admin model
      role: 'admin',
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
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        phonenumber: admin.phonenumber,
        role: admin.role,
      },
      token, // Include token separately or inside data, depending on your frontend needs
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to login',
    });
  }
};