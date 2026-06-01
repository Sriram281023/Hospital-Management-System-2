const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// @desc   Get all patients
// @route  GET /api/patients
exports.getPatients = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    // ─── RBAC Filtering ────────────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      query.userId = req.user._id;
    } else if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query.doctorId = doctor._id;
    }

    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { condition: { $regex: search, $options: "i" } },
      ];
    }
    const patients = await Patient.find(query)
      .populate("doctorId", "name specialty")
      .sort("-createdAt");
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single patient
// @route  GET /api/patients/:id
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("doctorId", "name specialty phone");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      if (patient.userId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only view your own record" });
      }
    } else if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || patient.doctorId?.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only view patients assigned to you" });
      }
    }

    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create patient
// @route  POST /api/patients
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update patient
// @route  PUT /api/patients/:id
exports.updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || patient.doctorId?.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only update patients assigned to you" });
      }
    } else if (req.user.role === "Patient") {
      return res.status(403).json({ success: false, message: "Access denied — patients cannot update patient profiles" });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate("doctorId", "name specialty");

    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Delete patient
// @route  DELETE /api/patients/:id
exports.deletePatient = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied — only Admin can delete patients" });
    }
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    res.json({ success: true, message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get patient stats
// @route  GET /api/patients/stats
exports.getPatientStats = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === "Doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.json({ success: true, data: [] });
      }
      matchQuery = { doctorId: doctor._id };
    } else if (req.user.role === "Patient") {
      matchQuery = { userId: req.user._id };
    }

    const stats = await Patient.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
