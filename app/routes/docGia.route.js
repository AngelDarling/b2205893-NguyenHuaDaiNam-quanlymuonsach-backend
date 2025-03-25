const express = require("express");
const docGia = require("../controllers/docGia.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router.route("/").get(docGia.findAll).post(docGia.create); // Không cần auth để độc giả tự đăng ký

router.route("/login").post(docGia.login);

router
  .route("/:id")
  .get(docGia.findOne)
  .put(auth, docGia.update)
  .delete(auth, docGia.delete);

module.exports = router;
