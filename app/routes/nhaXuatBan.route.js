// app/routes/nhaXuatBan.route.js
const express = require("express");
const nhaXuatBan = require("../controllers/nhaXuatBan.controller");
const router = express.Router();
const { auth, verifyTokenOnly } = require("../middleware/auth");

router
  .route("/")
  .get(verifyTokenOnly, nhaXuatBan.findAll)
  .post(auth, nhaXuatBan.create);

router
  .route("/:id")
  .get(verifyTokenOnly, nhaXuatBan.findOne)
  .put(auth, nhaXuatBan.update)
  .delete(auth, nhaXuatBan.delete);

module.exports = router;
