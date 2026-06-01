const Doctor = require("../models/Doctor");

// @desc   Get all doctors
// @route  GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const { search, status, specialty } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (specialty) query.specialty = specialty;
    if (search) {
      query.$or = [
        { name:      { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ];
    }
    const doctors = await Doctor.find(query).sort("-createdAt");
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single doctor
// @route  GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create doctor
// @route  POST /api/doctors
exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update doctor
// @route  PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Delete doctor
// @route  DELETE /api/doctors/:id
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
