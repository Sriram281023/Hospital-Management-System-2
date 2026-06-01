require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const patientController = require("./controllers/patientController");
const appointmentController = require("./controllers/appointmentController");
const billController = require("./controllers/billController");
const doctorController = require("./controllers/doctorController");

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

async function test() {
  try {
    await connectDB();
    
    const doctorUser = await User.findOne({ role: "Doctor" });
    const patientUser = await User.findOne({ role: "Patient" });

    console.log("Testing endpoints as Doctor...");
    {
      const req = { user: doctorUser, query: {} };
      
      const resP = mockResponse();
      await patientController.getPatients(req, resP);
      console.log(`Doctor -> GET /api/patients: ${resP.statusCode || 200} (count: ${resP.jsonData?.data?.length})`);

      const resD = mockResponse();
      await doctorController.getDoctors(req, resD);
      console.log(`Doctor -> GET /api/doctors: ${resD.statusCode || 200} (count: ${resD.jsonData?.data?.length})`);

      const resA = mockResponse();
      await appointmentController.getAppointments(req, resA);
      console.log(`Doctor -> GET /api/appointments: ${resA.statusCode || 200} (count: ${resA.jsonData?.data?.length})`);

      const resB = mockResponse();
      await billController.getBills(req, resB);
      console.log(`Doctor -> GET /api/bills: ${resB.statusCode || 200} (count: ${resB.jsonData?.data?.length})`);
    }

    console.log("\nTesting endpoints as Patient...");
    {
      const req = { user: patientUser, query: {} };

      const resP = mockResponse();
      await patientController.getPatients(req, resP);
      console.log(`Patient -> GET /api/patients: ${resP.statusCode || 200} (count: ${resP.jsonData?.data?.length})`);

      const resD = mockResponse();
      await doctorController.getDoctors(req, resD);
      console.log(`Patient -> GET /api/doctors: ${resD.statusCode || 200} (count: ${resD.jsonData?.data?.length})`);

      const resA = mockResponse();
      await appointmentController.getAppointments(req, resA);
      console.log(`Patient -> GET /api/appointments: ${resA.statusCode || 200} (count: ${resA.jsonData?.data?.length})`);

      const resB = mockResponse();
      await billController.getBills(req, resB);
      console.log(`Patient -> GET /api/bills: ${resB.statusCode || 200} (count: ${resB.jsonData?.data?.length})`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
