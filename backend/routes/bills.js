const express = require("express");
const router  = express.Router();
const {
  getBills, getBill, createBill, updateBill, deleteBill, getBillSummary,
} = require("../controllers/billController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.route("/summary").get(getBillSummary);
router.route("/")
  .get(getBills)
  .post(authorize("Admin"), createBill);
router.route("/:id")
  .get(getBill)
  .put(authorize("Admin"), updateBill)
  .delete(authorize("Admin"), deleteBill);

module.exports = router;
