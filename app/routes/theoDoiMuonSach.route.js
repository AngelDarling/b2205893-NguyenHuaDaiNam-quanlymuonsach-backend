// app/routes/theoDoiMuonSach.route.js
const express = require("express");
const theoDoiMuonSach = require("../controllers/theoDoiMuonSach.controller");
const router = express.Router();
const { auth, verifyTokenOnly } = require("../middleware/auth");

router
  .route("/")
  .get(verifyTokenOnly, theoDoiMuonSach.findAll)
  .post(verifyTokenOnly, theoDoiMuonSach.create);

router.route("/statistics").get(verifyTokenOnly, theoDoiMuonSach.getStatistics);

router
  .route("/:id")
  .get(verifyTokenOnly, theoDoiMuonSach.findOne)
  .put(auth, theoDoiMuonSach.update)
  .delete(auth, theoDoiMuonSach.delete);

router.route("/check-overdue").post(auth, theoDoiMuonSach.checkOverdueBooks);
router.route("/mark-returned/:id").put(auth, theoDoiMuonSach.markReturned);
module.exports = router;
