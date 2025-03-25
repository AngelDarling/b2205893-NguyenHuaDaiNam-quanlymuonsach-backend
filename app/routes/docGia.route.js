const express = require("express");
const docGia = require("../controllers/docgiaController");
const router = express.Router();
const auth = require("../middleware/auth");

router.route("/").get(docGia.findAll).post(docGia.create); // Không cần auth để độc giả tự đăng ký

router
  .route("/:id")
  .get(docGia.findOne)
  .put(auth, docGia.update)
  .delete(auth, docGia.delete);

router.post("/login", docGia.login);
module.exports = router;
