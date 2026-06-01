const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    const user = await User.create({ name, username, password, role });

    // Automatically provision clinical/work profile document
    if (role === "Patient") {
      await Patient.create({
        name: user.name,
        age: 30,
        gender: "Male",
        phone: "0000000000",
        email: `${user.username}@hospital.com`,
        blood: "O+",
        condition: "New Patient Registration",
        status: "Outpatient",
        userId: user._id
      });
    } else if (role === "Doctor") {
      await Doctor.create({
        name: user.name,
        specialty: "General Surgery",
        phone: "0000000000",
        email: `${user.username}@hospital.com`,
        userId: user._id
      });
    }

    const token = user.getSignedToken();
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Please provide username and password" });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = user.getSignedToken();
    res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};
