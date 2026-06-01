const express = require("express");
const router  = express.Router();
const {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.route("/")
  .get(getDoctors)
  .post(authorize("Admin"), createDoctor);
router.route("/:id")
  .get(getDoctor)
  .put(authorize("Admin"), updateDoctor)
  .delete(authorize("Admin"), deleteDoctor);

module.exports = router;
