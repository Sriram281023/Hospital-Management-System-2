const mongoose = require("mongoose");

const BillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amt:  { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const BillSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    date:      { type: Date, default: Date.now },
    items:     { type: [BillItemSchema], required: true, validate: v => v.length > 0 },
    status:    { type: String, enum: ["Pending","Paid","Cancelled"], default: "Pending" },
    paidAt:    { type: Date },
  },
  { timestamps: true }
);

// Virtual: total
BillSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => sum + item.amt, 0);
});

BillSchema.set("toJSON",   { virtuals: true });
BillSchema.set("toObject", { virtuals: true });

// Auto-populate patient on find
BillSchema.pre(/^find/, function (next) {
  this.populate("patientId", "name phone email");
  next();
});

module.exports = mongoose.model("Bill", BillSchema);
