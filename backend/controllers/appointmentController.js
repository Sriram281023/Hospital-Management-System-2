const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Helper to get patient or doctor document for logged in user
const getAssociatedRoleDoc = async (user) => {
  if (user.role === "Patient") {
    return await Patient.findOne({ userId: user._id });
  } else if (user.role === "Doctor") {
    return await Doctor.findOne({ userId: user._id });
  }
  return null;
};

// @desc   Get all appointments
// @route  GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date } = req.query;
    const query = {};

    // ─── RBAC Filtering ────────────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query.patientId = patient._id;
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query.doctorId = doctor._id;
    } else {
      // Admin filters
      if (doctorId)  query.doctorId  = doctorId;
      if (patientId) query.patientId = patientId;
    }

    if (status && status !== "All") query.status = status;
    if (date) query.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };

    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single appointment
// @route  GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient || appt.patientId?._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only view your own appointments" });
      }
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor || appt.doctorId?._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only view your own appointments" });
      }
    }

    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create appointment
// @route  POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const bodyData = { ...req.body };

    // ─── RBAC Automatic Integrity ─────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient) {
        return res.status(400).json({ success: false, message: "No patient profile linked to this user" });
      }
      bodyData.patientId = patient._id;
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor) {
        return res.status(400).json({ success: false, message: "No doctor profile linked to this user" });
      }
      bodyData.doctorId = doctor._id;
    }

    const appt = await Appointment.create(bodyData);
    // Populate before response so frontend gets populated fields immediately
    const populatedAppt = await Appointment.findById(appt._id);
    res.status(201).json({ success: true, data: populatedAppt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update appointment (status, reschedule, etc.)
// @route  PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient || appt.patientId?._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only modify your own appointments" });
      }
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor || appt.doctorId?._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only modify your own appointments" });
      }
    }

    const updatedAppt = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    res.json({ success: true, data: updatedAppt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Delete appointment
// @route  DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient || appt.patientId?._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only delete your own appointments" });
      }
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor || appt.doctorId?._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only delete your own appointments" });
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get appointment stats for dashboard
// @route  GET /api/appointments/stats
exports.getStats = async (req, res) => {
  try {
    let matchQuery = {};

    // ─── RBAC Filtering ────────────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedRoleDoc(req.user);
      if (!patient) {
        return res.json({ success: true, data: { byStatus: [], byType: [] } });
      }
      matchQuery = { patientId: patient._id };
    } else if (req.user.role === "Doctor") {
      const doctor = await getAssociatedRoleDoc(req.user);
      if (!doctor) {
        return res.json({ success: true, data: { byStatus: [], byType: [] } });
      }
      matchQuery = { doctorId: doctor._id };
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const byType = await Appointment.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { byStatus: stats, byType } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
