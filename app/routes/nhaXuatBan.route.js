const express = require("express");
const router = express.Router();
const nhaXuatBanController = require("../controllers/nhaxuatbanController");
const auth = require("../middleware/auth");

router.get("/", nhaXuatBanController.getAllNhaXuatBan);
router.post("/", auth, nhaXuatBanController.createNhaXuatBan);
router.put("/:id", auth, nhaXuatBanController.updateNhaXuatBan);
router.delete("/:id", auth, nhaXuatBanController.deleteNhaXuatBan);

module.exports = router;
