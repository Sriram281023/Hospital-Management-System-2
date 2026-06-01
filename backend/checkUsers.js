require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function check() {
  try {
    await connectDB();
    const users = await User.find({}, "name username role");
    console.log("Current Database Users:");
    console.log(users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
