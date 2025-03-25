const express = require("express");
const nhanVien = require("../controllers/nhanVien.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router.route("/").get(nhanVien.findAll).post(auth, nhanVien.create);

router.route("/login").post(nhanVien.login);

router
  .route("/:id")
  .get(nhanVien.findOne)
  .put(auth, nhanVien.update)
  .delete(auth, nhanVien.delete);

module.exports = router;
