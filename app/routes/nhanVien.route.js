// app/routes/nhanVien.route.js
const express = require("express");
const nhanVien = require("../controllers/nhanVien.controller");
const router = express.Router();
const { auth, verifyTokenOnly } = require("../middleware/auth");

router
  .route("/")
  .get(verifyTokenOnly, nhanVien.findAll)
  .post(auth, nhanVien.create);

router.post("/login", nhanVien.login);

router
  .route("/:id")
  .get(verifyTokenOnly, nhanVien.findOne)
  .put(auth, nhanVien.update)
  .delete(auth, nhanVien.delete);

module.exports = router;
