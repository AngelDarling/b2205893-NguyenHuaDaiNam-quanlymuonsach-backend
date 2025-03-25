const express = require("express");
const nhaXuatBan = require("../controllers/nhaXuatBan.controller");
const router = express.Router();
const auth = require("../middleware/auth");

router.route("/").get(nhaXuatBan.findAll).post(auth, nhaXuatBan.create);

router
  .route("/:id")
  .get(nhaXuatBan.findOne)
  .put(auth, nhaXuatBan.update)
  .delete(auth, nhaXuatBan.delete);

module.exports = router;
