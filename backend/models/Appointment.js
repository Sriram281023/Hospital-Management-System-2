const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Doctor",  required: true },
    date:      { type: Date, required: [true, "Appointment date is required"] },
    time:      { type: String, required: [true, "Appointment time is required"] },
    type:      {
      type: String,
      enum: ["Consultation","Follow-up","Emergency","Lab Test","Surgery"],
      default: "Consultation",
    },
    status:    { type: String, enum: ["Scheduled","Completed","Cancelled"], default: "Scheduled" },
    notes:     { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-populate on find
AppointmentSchema.pre(/^find/, function (next) {
  this.populate("patientId", "name blood phone")
      .populate("doctorId",  "name specialty");
  next();
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
