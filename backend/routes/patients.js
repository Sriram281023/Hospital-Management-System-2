const express = require("express");
const router  = express.Router();
const {
  getPatients, getPatient, createPatient,
  updatePatient, deletePatient, getPatientStats,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect); // all patient routes need auth

router.route("/stats").get(getPatientStats);
router.route("/")
  .get(getPatients)
  .post(authorize("Admin", "Doctor"), createPatient);
router.route("/:id")
  .get(getPatient)
  .put(authorize("Admin", "Doctor"), updatePatient)
  .delete(authorize("Admin"), deletePatient);

module.exports = router;
