require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Bill = require("./models/Bill");

const patientController = require("./controllers/patientController");
const appointmentController = require("./controllers/appointmentController");
const billController = require("./controllers/billController");

// Helper to create mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

async function runTests() {
  try {
    await connectDB();
    console.log("🏥 Connected to database for security verification...");

    // Fetch seed users
    const adminUser = await User.findOne({ role: "Admin" });
    const doctorUser = await User.findOne({ role: "Doctor" });
    const patientUser = await User.findOne({ role: "Patient" });

    if (!adminUser || !doctorUser || !patientUser) {
      throw new Error("Seed users not found. Please run 'npm run seed' first.");
    }

    // Fetch corresponding doctor/patient profiles
    const doctorProfile = await Doctor.findOne({ userId: doctorUser._id });
    const patientProfile = await Patient.findOne({ userId: patientUser._id });

    // Fetch another patient (assigned to another doctor if possible, or just a different patient)
    const otherPatient = await Patient.findOne({ userId: { $ne: patientUser._id } });

    console.log(`\n🔑 Profiles resolved:`);
    console.log(`   - Patient User: ${patientUser.username} (Patient Profile ID: ${patientProfile._id})`);
    console.log(`   - Doctor User: ${doctorUser.username} (Doctor Profile ID: ${doctorProfile._id})`);
    console.log(`   - Admin User: ${adminUser.username}`);

    let totalTests = 0;
    let failedTests = 0;

    const assert = (condition, message) => {
      totalTests++;
      if (condition) {
        console.log(`   ✅ PASS: ${message}`);
      } else {
        console.log(`   ❌ FAIL: ${message}`);
        failedTests++;
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🧪 Test Category 1: Patient Data Isolation");

    // Case A: Patient requests all patients (should only return themselves)
    {
      const req = { user: patientUser, query: {} };
      const res = mockResponse();
      await patientController.getPatients(req, res);
      assert(
        res.jsonData && res.jsonData.success === true && res.jsonData.data.length === 1 && res.jsonData.data[0]._id.toString() === patientProfile._id.toString(),
        "Patient requesting patients list only gets their own record."
      );
    }

    // Case B: Patient requests single other patient details (should be Forbidden 403)
    if (otherPatient) {
      const req = { user: patientUser, params: { id: otherPatient._id } };
      const res = mockResponse();
      await patientController.getPatient(req, res);
      assert(
        res.statusCode === 403 && res.jsonData.success === false,
        "Patient requesting another patient's detail view gets 403 Forbidden."
      );
    }

    // Case C: Patient updates patient details (should be Forbidden 403)
    {
      const req = { user: patientUser, params: { id: patientProfile._id }, body: { age: 99 } };
      const res = mockResponse();
      await patientController.updatePatient(req, res);
      assert(
        res.statusCode === 403 && res.jsonData.success === false,
        "Patient attempting to update patient records gets 403 Forbidden."
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🧪 Test Category 2: Doctor Patient Access Isolation");

    // Case A: Doctor requests patients list (should return only patients assigned to them)
    {
      const req = { user: doctorUser, query: {} };
      const res = mockResponse();
      await patientController.getPatients(req, res);
      const allPatientsAreAssigned = res.jsonData.data.every(p => p.doctorId?._id.toString() === doctorProfile._id.toString());
      assert(
        res.jsonData && res.jsonData.success === true && allPatientsAreAssigned,
        "Doctor requesting patients list only gets patients assigned to them."
      );
    }

    // Case B: Doctor requests patient not assigned to them (should be Forbidden 403)
    {
      const unassignedPatient = await Patient.findOne({ doctorId: { $ne: doctorProfile._id } });
      if (unassignedPatient) {
        const req = { user: doctorUser, params: { id: unassignedPatient._id } };
        const res = mockResponse();
        await patientController.getPatient(req, res);
        assert(
          res.statusCode === 403 && res.jsonData.success === false,
          "Doctor requesting an unassigned patient's details gets 403 Forbidden."
        );
      } else {
        console.log("   ⚠️ Skip: No unassigned patients found to test Doctor isolation.");
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🧪 Test Category 3: Appointment Access Control");

    // Case A: Patient requests all appointments (should only return their own)
    {
      const req = { user: patientUser, query: {} };
      const res = mockResponse();
      await appointmentController.getAppointments(req, res);
      const allApptsForPatient = res.jsonData.data.every(a => a.patientId?._id.toString() === patientProfile._id.toString());
      assert(
        res.jsonData && res.jsonData.success === true && allApptsForPatient,
        "Patient requesting appointments list only gets their own appointments."
      );
    }

    // Case B: Patient requests single other appointment (should be Forbidden 403)
    {
      const otherAppt = await Appointment.findOne({ patientId: { $ne: patientProfile._id } });
      if (otherAppt) {
        const req = { user: patientUser, params: { id: otherAppt._id } };
        const res = mockResponse();
        await appointmentController.getAppointment(req, res);
        assert(
          res.statusCode === 403 && res.jsonData.success === false,
          "Patient requesting another user's appointment details gets 403 Forbidden."
        );
      } else {
        console.log("   ⚠️ Skip: No other appointments found to test Patient appointment isolation.");
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🧪 Test Category 4: Billing Access Control");

    // Case A: Patient requests all bills (should only return their own)
    {
      const req = { user: patientUser, query: {} };
      const res = mockResponse();
      await billController.getBills(req, res);
      const allBillsForPatient = res.jsonData.data.every(b => b.patientId?._id.toString() === patientProfile._id.toString());
      assert(
        res.jsonData && res.jsonData.success === true && allBillsForPatient,
        "Patient requesting bills only gets their own billing records."
      );
    }

    // Case B: Doctor requests billing list (should return empty list or fail)
    {
      const req = { user: doctorUser, query: {} };
      const res = mockResponse();
      await billController.getBills(req, res);
      assert(
        res.jsonData && res.jsonData.success === true && res.jsonData.data.length === 0,
        "Doctor requesting billing list is blocked (returns empty array)."
      );
    }

    // Case C: Doctor requests single bill details (should be Forbidden 403)
    {
      const anyBill = await Bill.findOne({});
      if (anyBill) {
        const req = { user: doctorUser, params: { id: anyBill._id } };
        const res = mockResponse();
        await billController.getBill(req, res);
        assert(
          res.statusCode === 403 && res.jsonData.success === false,
          "Doctor requesting any single bill details gets 403 Forbidden."
        );
      }
    }

    // Case D: Patient creates a bill (should be Forbidden 403)
    {
      const req = { user: patientUser, body: { patientId: patientProfile._id, items: [{ name: "Consultation", amt: 100 }] } };
      const res = mockResponse();
      await billController.createBill(req, res);
      assert(
        res.statusCode === 403 && res.jsonData.success === false,
        "Patient attempting to create a bill gets 403 Forbidden."
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🧪 Test Category 5: Admin Unrestricted Access");

    // Case A: Admin requests all patients
    {
      const req = { user: adminUser, query: {} };
      const res = mockResponse();
      await patientController.getPatients(req, res);
      assert(
        res.jsonData && res.jsonData.success === true && res.jsonData.data.length > 1,
        "Admin requesting patients list retrieves all patient profiles."
      );
    }

    // Case B: Admin requests all bills
    {
      const req = { user: adminUser, query: {} };
      const res = mockResponse();
      await billController.getBills(req, res);
      assert(
        res.jsonData && res.jsonData.success === true && res.jsonData.data.length > 0,
        "Admin requesting bills retrieves all billing items."
      );
    }

    console.log("\n─────────────────────────────────────────────────────────────────────────");
    console.log(`📊 Security Test Report: ${totalTests - failedTests}/${totalTests} Passed.`);
    if (failedTests > 0) {
      console.log(`❌ WARNING: ${failedTests} security vulnerabilities detected!`);
      process.exit(1);
    } else {
      console.log("🛡️ All security checks passed! RBAC boundaries are fully sealed.");
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ Test script error:", err);
    process.exit(1);
  }
}

runTests();
