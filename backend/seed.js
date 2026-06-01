require("dotenv").config();
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const connectDB = require("./config/db");
const User      = require("./models/User");
const Doctor    = require("./models/Doctor");
const Patient   = require("./models/Patient");
const Appointment = require("./models/Appointment");
const Bill      = require("./models/Bill");

connectDB();

const seed = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Patient.deleteMany(),
      Appointment.deleteMany(),
      Bill.deleteMany(),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create users
    const users = await User.create([
      { name: "Admin User",     username: "admin",   password: "admin123",  role: "Admin"   },
      { name: "Dr. Sarah Chen", username: "doctor",  password: "doc123",    role: "Doctor"  },
      { name: "Arjun Reddy",   username: "patient", password: "pat123",    role: "Patient" },
    ]);
    console.log("✅ Users created");

    // Create doctors
    const doctors = await Doctor.create([
      { name:"Dr. Sarah Chen",   specialty:"Cardiology",  phone:"+91-98765-43210", email:"s.chen@citycare.in",   exp:12, status:"Active",   schedule:"Mon–Fri",  patients:24, userId: users[1]._id },
      { name:"Dr. Rajan Mehta",  specialty:"Neurology",   phone:"+91-98765-43211", email:"r.mehta@citycare.in",  exp:8,  status:"Active",   schedule:"Mon–Thu",  patients:18 },
      { name:"Dr. Priya Sharma", specialty:"Pediatrics",  phone:"+91-98765-43212", email:"p.sharma@citycare.in", exp:15, status:"Active",   schedule:"Tue–Sat",  patients:32 },
      { name:"Dr. Amir Khan",    specialty:"Orthopedics", phone:"+91-98765-43213", email:"a.khan@citycare.in",   exp:10, status:"On Leave", schedule:"Mon–Wed",  patients:15 },
      { name:"Dr. Lakshmi Rao",  specialty:"Dermatology", phone:"+91-98765-43214", email:"l.rao@citycare.in",    exp:7,  status:"Active",   schedule:"Wed–Sun",  patients:28 },
    ]);
    console.log("✅ Doctors created");

    // Create patients
    const patients = await Patient.create([
      { name:"Arjun Reddy",    age:45, gender:"Male",   phone:"+91-90000-00001", email:"arjun@gmail.com",  blood:"O+",  condition:"Hypertension",     doctorId:doctors[0]._id, status:"Admitted",   since:"2024-01-15", userId: users[2]._id },
      { name:"Meera Patel",    age:32, gender:"Female", phone:"+91-90000-00002", email:"meera@gmail.com",  blood:"A+",  condition:"Diabetes Type 2",  doctorId:doctors[0]._id, status:"Outpatient",  since:"2024-02-10" },
      { name:"Sanjay Kumar",   age:58, gender:"Male",   phone:"+91-90000-00003", email:"sanjay@gmail.com", blood:"B+",  condition:"Chronic Migraine", doctorId:doctors[1]._id, status:"Admitted",   since:"2024-01-28" },
      { name:"Ananya Singh",   age:8,  gender:"Female", phone:"+91-90000-00004", email:"parent@gmail.com", blood:"AB-", condition:"Asthma",           doctorId:doctors[2]._id, status:"Outpatient",  since:"2024-03-05" },
      { name:"Vikram Nair",    age:38, gender:"Male",   phone:"+91-90000-00005", email:"vikram@gmail.com", blood:"O-",  condition:"Femur Fracture",   doctorId:doctors[3]._id, status:"Admitted",   since:"2024-02-20" },
      { name:"Divya Krishnan", age:29, gender:"Female", phone:"+91-90000-00006", email:"divya@gmail.com",  blood:"A-",  condition:"Eczema",           doctorId:doctors[4]._id, status:"Discharged",  since:"2024-03-12" },
      { name:"Rajesh Verma",   age:62, gender:"Male",   phone:"+91-90000-00007", email:"rajesh@gmail.com", blood:"B-",  condition:"Osteoarthritis",   doctorId:doctors[3]._id, status:"Outpatient",  since:"2024-01-08" },
      { name:"Sneha Reddy",    age:24, gender:"Female", phone:"+91-90000-00008", email:"sneha@gmail.com",  blood:"O+",  condition:"Anxiety Disorder", doctorId:doctors[1]._id, status:"Outpatient",  since:"2024-03-20" },
    ]);
    console.log("✅ Patients created");

    // Create appointments
    await Appointment.create([
      { patientId:patients[0]._id, doctorId:doctors[0]._id, date:"2024-04-10", time:"09:00", type:"Follow-up",    status:"Scheduled", notes:"BP checkup" },
      { patientId:patients[1]._id, doctorId:doctors[0]._id, date:"2024-04-02", time:"10:30", type:"Consultation", status:"Completed", notes:"HbA1c review" },
      { patientId:patients[2]._id, doctorId:doctors[1]._id, date:"2024-04-12", time:"11:00", type:"Follow-up",    status:"Scheduled", notes:"Migraine meds" },
      { patientId:patients[3]._id, doctorId:doctors[2]._id, date:"2024-04-03", time:"14:00", type:"Emergency",    status:"Completed", notes:"Acute asthma" },
      { patientId:patients[4]._id, doctorId:doctors[3]._id, date:"2024-04-05", time:"15:30", type:"Consultation", status:"Cancelled", notes:"X-ray review" },
      { patientId:patients[5]._id, doctorId:doctors[4]._id, date:"2024-04-15", time:"09:30", type:"Follow-up",    status:"Scheduled", notes:"Skin treatment" },
      { patientId:patients[6]._id, doctorId:doctors[3]._id, date:"2024-04-18", time:"16:00", type:"Consultation", status:"Scheduled", notes:"Joint pain" },
      { patientId:patients[7]._id, doctorId:doctors[1]._id, date:"2024-04-11", time:"10:00", type:"Follow-up",    status:"Scheduled", notes:"Anxiety review" },
    ]);
    console.log("✅ Appointments created");

    // Create bills
    await Bill.create([
      { patientId:patients[0]._id, date:"2024-03-15", items:[{name:"Room Charges",amt:5000},{name:"Consultation",amt:1500},{name:"Medicines",amt:800}],  status:"Paid"    },
      { patientId:patients[1]._id, date:"2024-03-20", items:[{name:"Lab Tests",amt:2500},{name:"Consultation",amt:1500}],                                status:"Pending" },
      { patientId:patients[2]._id, date:"2024-03-25", items:[{name:"Room Charges",amt:8000},{name:"MRI Scan",amt:6000},{name:"Medicines",amt:1200}],      status:"Paid"    },
      { patientId:patients[4]._id, date:"2024-03-28", items:[{name:"Surgery",amt:45000},{name:"Room Charges",amt:12000},{name:"Medicines",amt:3500}],     status:"Pending" },
      { patientId:patients[5]._id, date:"2024-04-01", items:[{name:"Consultation",amt:1500},{name:"Medicines",amt:2000}],                                status:"Paid"    },
      { patientId:patients[6]._id, date:"2024-04-05", items:[{name:"Lab Tests",amt:3000},{name:"Consultation",amt:1500},{name:"Physiotherapy",amt:4000}], status:"Pending" },
    ]);
    console.log("✅ Bills created");

    console.log("\n🎉 Database seeded successfully!");
    console.log("─────────────────────────────────");
    console.log("Login credentials:");
    console.log("  Admin   → username: admin   | password: admin123");
    console.log("  Doctor  → username: doctor  | password: doc123");
    console.log("  Patient → username: patient | password: pat123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

seed();
