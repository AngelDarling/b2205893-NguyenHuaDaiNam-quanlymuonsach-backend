const NhanVien = require("../models/NhanVien");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng nhập
exports.login = async (req, res) => {
  const { MSNV, Password } = req.body;

  try {
    const nhanvien = await NhanVien.findOne({ MSNV });
    if (!nhanvien)
      return res
        .status(400)
        .json({ message: "Thông tin đăng nhập không đúng" });

    const isMatch = await bcrypt.compare(Password, nhanvien.Password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Thông tin đăng nhập không đúng" });

    const payload = { user: { id: nhanvien.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
