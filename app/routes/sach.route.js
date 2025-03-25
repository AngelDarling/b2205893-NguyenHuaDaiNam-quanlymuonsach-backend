const express = require("express");
const sachs = require("../controllers/sach.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router
  .route("/")
  .get(sachs.findAll)
  .post(auth, sachs.createSach);

router
  .route("/:id")
  .put(auth, sachs.updateSach)
  .delete(auth, sachs.deleteSach);

module.exports = router;