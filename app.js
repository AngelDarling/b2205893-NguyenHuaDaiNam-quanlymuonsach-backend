// app.js
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const nhanVienRouter = require("./app/routes/nhanVien.route");
const docGiaRouter = require("./app/routes/docGia.route");
const theoDoiMuonSachRouter = require("./app/routes/theoDoiMuonSach.route");
const sachRouter = require("./app/routes/sach.route");
const nhaXuatBanRouter = require("./app/routes/nhaXuatBan.route");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/nhanVien", nhanVienRouter);
app.use("/docGia", docGiaRouter);
app.use("/theoDoiMuonSach", theoDoiMuonSachRouter);
app.use("/sach", sachRouter);
app.use("/nhaXuatBan", nhaXuatBanRouter);

// Xử lý lỗi 404
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

// Xử lý lỗi chung
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
});

const { getAdminToken } = require("./app/middleware/auth");

// Lên lịch chạy mỗi ngày lúc 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Kiểm tra bản ghi mượn sách quá hạn...");

    // Lấy token admin tự động
    const token = await getAdminToken();

    // Gọi API check-overdue với token
    const response = await axios.post(
      "http://localhost:3000/theoDoiMuonSach/check-overdue",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(response.data.message);
  } catch (error) {
    console.error("Lỗi khi kiểm tra bản ghi quá hạn:", error.message);
  }
});
module.exports = app;