require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");

async function check() {
  try {
    await connectDB();
    
    console.log("Checking Doctor Profiles:");
    const doctors = await Doctor.find({}, "name userId");
    console.log(doctors);

    console.log("\nChecking Patient Profiles:");
    const patients = await Patient.find({}, "name userId");
    console.log(patients);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
