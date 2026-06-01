const express = require("express");
const router  = express.Router();
const {
  getAppointments, getAppointment, createAppointment,
  updateAppointment, deleteAppointment, getStats,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.route("/stats").get(getStats);
router.route("/")
  .get(getAppointments)
  .post(authorize("Admin", "Doctor", "Patient"), createAppointment);
router.route("/:id")
  .get(getAppointment)
  .put(authorize("Admin", "Doctor", "Patient"), updateAppointment)
  .delete(authorize("Admin", "Doctor", "Patient"), deleteAppointment);

module.exports = router;
