// app/routes/docGia.route.js
const express = require("express");
const docGia = require("../controllers/docGia.controller");
const router = express.Router();
const { auth, verifyTokenOnly } = require("../middleware/auth");

router
  .route("/")
  .get(verifyTokenOnly, docGia.findAll)
  .post(docGia.create);

router.route("/login").post(docGia.login);

router
  .route("/:id")
  .get(verifyTokenOnly, docGia.findOne)
  .put(auth, docGia.update)
  .delete(auth, docGia.delete);

module.exports = router;
