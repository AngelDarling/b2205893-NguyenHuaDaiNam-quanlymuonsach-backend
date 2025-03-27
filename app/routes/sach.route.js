const express = require("express");
const sach = require("../controllers/sach.controller");
const router = express.Router();
const { auth, verifyTokenOnly } = require("../middleware/auth");

router.route("/").get(verifyTokenOnly, sach.find).post(auth, sach.create);

router
  .route("/:id")
  .get(verifyTokenOnly, sach.findById)
  .put(auth, sach.update)
  .delete(auth, sach.delete);

module.exports = router;
