const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, "Patient name is required"], trim: true },
    age:       { type: Number, required: [true, "Age is required"], min: 0, max: 150 },
    gender:    { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone:     { type: String, required: [true, "Phone is required"], trim: true },
    email:     { type: String, trim: true, lowercase: true },
    blood:     { type: String, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"], required: true },
    condition: { type: String, required: [true, "Condition/diagnosis is required"], trim: true },
    address:   { type: String, trim: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status:    { type: String, enum: ["Admitted","Outpatient","Discharged"], default: "Outpatient" },
    since:     { type: Date, default: Date.now },
    notes:     { type: String, trim: true },
  },
  { timestamps: true }
);

// Virtual for full info
PatientSchema.virtual("doctor", {
  ref: "Doctor",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

PatientSchema.set("toJSON", { virtuals: true });
PatientSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Patient", PatientSchema);
