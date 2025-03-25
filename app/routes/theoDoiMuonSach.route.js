const express = require("express");
const theoDoiMuonSach = require("../controllers/theoDoiMuonSach.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router
  .route("/")
  .get(theoDoiMuonSach.findAll)
  .post(auth, theoDoiMuonSach.create);

router
  .route("/:id")
  .get(theoDoiMuonSach.findOne)
  .put(auth, theoDoiMuonSach.update)
  .delete(auth, theoDoiMuonSach.delete);

module.exports = router;
