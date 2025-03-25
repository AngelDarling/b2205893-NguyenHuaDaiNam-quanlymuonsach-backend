const express = require("express");
const sach = require("../controllers/sach.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router.route("/").get(sach.findAll).post(auth, sach.create);

router
  .route("/:id")
  .get(sach.findOne)
  .put(auth, sach.update)
  .delete(auth, sach.delete);

module.exports = router;
