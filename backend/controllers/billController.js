const Bill = require("../models/Bill");
const Patient = require("../models/Patient");

// Helper to get patient document for logged in patient user
const getAssociatedPatient = async (user) => {
  if (user.role === "Patient") {
    return await Patient.findOne({ userId: user._id });
  }
  return null;
};

// @desc   Get all bills
// @route  GET /api/bills
exports.getBills = async (req, res) => {
  try {
    const { status, patientId } = req.query;
    const query = {};

    // ─── RBAC Filtering ────────────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedPatient(req.user);
      if (!patient) {
        return res.json({ success: true, count: 0, data: [] });
      }
      query.patientId = patient._id;
    } else if (req.user.role === "Doctor") {
      // Doctors don't see billing details
      return res.json({ success: true, count: 0, data: [] });
    } else {
      // Admin filter
      if (patientId) query.patientId = patientId;
    }

    if (status && status !== "All") query.status = status;

    const bills = await Bill.find(query).sort("-date");
    res.json({ success: true, count: bills.length, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single bill
// @route  GET /api/bills/:id
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    // ─── RBAC Access Control ───────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedPatient(req.user);
      if (!patient || bill.patientId?._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied — you can only view your own bills" });
      }
    } else if (req.user.role === "Doctor") {
      return res.status(403).json({ success: false, message: "Access denied — doctors cannot view billing details" });
    }

    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create bill
// @route  POST /api/bills
exports.createBill = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied — only Admins can create bills" });
    }
    const bill = await Bill.create(req.body);
    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update bill (mark paid, edit items, etc.)
// @route  PUT /api/bills/:id
exports.updateBill = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied — only Admins can update bills" });
    }
    const updateData = { ...req.body };
    if (updateData.status === "Paid") updateData.paidAt = new Date();

    const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Delete bill
// @route  DELETE /api/bills/:id
exports.deleteBill = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied — only Admins can delete bills" });
    }
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
    res.json({ success: true, message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Revenue summary for dashboard
// @route  GET /api/bills/summary
exports.getBillSummary = async (req, res) => {
  try {
    let matchQuery = {};

    // ─── RBAC Filtering ────────────────────────────────────────────────────────
    if (req.user.role === "Patient") {
      const patient = await getAssociatedPatient(req.user);
      if (!patient) {
        return res.json({ success: true, data: { summary: [], monthly: [] } });
      }
      matchQuery = { patientId: patient._id };
    } else if (req.user.role === "Doctor") {
      return res.json({ success: true, data: { summary: [], monthly: [] } });
    }

    const summary = await Bill.aggregate([
      { $match: matchQuery },
      { $unwind: "$items" },
      { $group: { _id: "$status", total: { $sum: "$items.amt" }, count: { $sum: 1 } } },
    ]);
    
    const monthly = await Bill.aggregate([
      { $match: { ...matchQuery, status: "Paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          revenue: { $sum: "$items.amt" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);
    res.json({ success: true, data: { summary, monthly } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
