require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function test() {
  try {
    await connectDB();
    
    const credentials = [
      { username: "admin", password: "admin123" },
      { username: "doctor", password: "doc123" },
      { username: "patient", password: "pat123" },
    ];

    for (const cred of credentials) {
      const user = await User.findOne({ username: cred.username }).select("+password");
      if (!user) {
        console.log(`❌ User not found: ${cred.username}`);
        continue;
      }
      const isMatch = await user.matchPassword(cred.password);
      console.log(`User: ${cred.username} | Role: ${user.role} | Password check for "${cred.password}": ${isMatch ? "✅ MATCH" : "❌ MISMATCH"}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
