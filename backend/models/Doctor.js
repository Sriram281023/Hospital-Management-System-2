const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, "Doctor name is required"], trim: true },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      enum: ["Cardiology","Neurology","Pediatrics","Orthopedics","Dermatology",
             "Oncology","General Surgery","ENT","Ophthalmology","Psychiatry"],
    },
    phone:     { type: String, required: [true, "Phone is required"], trim: true },
    email:     { type: String, required: [true, "Email is required"], trim: true, lowercase: true },
    exp:       { type: Number, default: 0, min: 0 },
    status:    { type: String, enum: ["Active","On Leave","Inactive"], default: "Active" },
    schedule:  { type: String, trim: true, default: "Mon–Fri" },
    patients:  { type: Number, default: 0 },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
