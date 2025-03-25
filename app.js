const express = require("express");
const cors = require("cors");
const docGiaRouter = require("./app/routes/docGia.route");
const sachRouter = require("./app/routes/sach.route");
const nhaXuatBanRouter = require("./app/routes/nhaXuatBan.route");
const theoDoiMuonSachRouter = require("./app/routes/theoDoiMuonSach.route");
const nhanVienRouter = require("./app/routes/nhanVien.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/docgia", docGiaRouter);
app.use("/api/sach", sachRouter);
app.use("/api/nhaxuatban", nhaXuatBanRouter);
app.use("/api/theodoimuonsach", theoDoiMuonSachRouter);
app.use("/api/nhanvien", nhanVienRouter);

// Xử lý lỗi 404
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
