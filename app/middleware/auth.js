// app/middlewares/auth.js
const jwt = require("jsonwebtoken");
const axios = require("axios");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;

    if (req.user.role !== "nhanVien") {
      return res
        .status(403)
        .json({
          message: "Chỉ nhân viên mới có quyền thực hiện hành động này.",
        });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const verifyTokenOnly = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
const NhanVienService = require("../services/nhanVien.service");
const MongoDB = require("../utils/mongodb.util");
let adminToken = null;
let tokenExpiration = null;

const getAdminToken = async () => {
  const currentTime = Date.now();

  // Nếu token còn hạn, trả về token hiện tại
  if (adminToken && tokenExpiration && currentTime < tokenExpiration) {
    return adminToken;
  }

  try {
    // Tạo instance của NhanVienService
    const nhanVienService = new NhanVienService(MongoDB.client);

    // Lấy một tài khoản admin bất kỳ
    let adminAccount = await nhanVienService.findOneAdmin();
    if (!adminAccount) {
      console.log("Không tìm thấy tài khoản admin, tạo tài khoản mặc định...");

      // Tạo tài khoản admin mặc định
      adminAccount = await nhanVienService.create({
        TenDangNhap: "default_admin",
        MatKhau: "default_admin_123", // Nên mã hóa trong thực tế
        VaiTro: "nhanVien",
        HoTen: "Default Admin",
        DiaChi: "Hà Nội",
        SoDienThoai: "0123456789",
        Email: "default_admin@example.com",
      });
    }

    // Gọi API đăng nhập với thông tin của tài khoản admin
    const response = await axios.post("http://localhost:3000/dang-nhap", {
      TenDangNhap: adminAccount.TenDangNhap,
      MatKhau: adminAccount.MatKhau,
    });

    if (response.data && response.data.token) {
      adminToken = response.data.token;
      tokenExpiration = currentTime + 3600 * 1000 - 5 * 60 * 1000;
      return adminToken;
    } else {
      throw new Error("Không thể lấy token admin");
    }
  } catch (error) {
    console.error("Lỗi khi lấy token admin:", error.message);
    throw error;
  }
};
module.exports = { auth, verifyTokenOnly, getAdminToken };
