const express = require("express");
const router = express.Router();
const theoDoiMuonSachController = require("../controllers/theodoimuonsachController");
const auth = require("../middleware/auth");

router.get("/", theoDoiMuonSachController.getAllTheoDoiMuonSach);
router.post("/", auth, theoDoiMuonSachController.createTheoDoiMuonSach);
router.put("/:id", auth, theoDoiMuonSachController.updateTheoDoiMuonSach);
router.delete("/:id", auth, theoDoiMuonSachController.deleteTheoDoiMuonSach);

module.exports = router;
