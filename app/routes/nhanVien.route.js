const express = require("express");
const router = express.Router();
const nhanvienController = require("../controllers/nhanvienController");

router.post("/login", nhanvienController.login);

module.exports = router;
