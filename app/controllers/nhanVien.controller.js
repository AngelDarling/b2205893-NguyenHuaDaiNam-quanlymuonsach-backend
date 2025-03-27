// controllers/nhanVien.controller.js
const NhanVienService = require("../services/nhanVien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.create = async (req, res, next) => {
  if (!req.body?.MSNV || !req.body?.Password) {
    return next(new ApiError(400, "MSNV và Password không được để trống"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const existingNhanVien = await nhanVienService.findByMSNV(req.body.MSNV);
    if (existingNhanVien) {
      return next(new ApiError(400, "MSNV đã tồn tại"));
    }
    const document = await nhanVienService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo nhân viên:", error);
    if (error.code === 11000) {
      return next(new ApiError(400, "MSNV đã tồn tại"));
    }
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi tạo nhân viên: ${error.message}`)
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const { search, page, limit } = req.query;
    const result = await nhanVienService.find({}, { search, page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi lấy danh sách nhân viên: ${error.message}`
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy nhân viên với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật nhân viên với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }
    return res.send({ message: "Nhân viên đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa nhân viên:", error);
    return next(
      new ApiError(
        500,
        `Không thể xóa nhân viên với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.login = async (req, res, next) => {
  const { MSNV, Password } = req.body;

  if (!MSNV || !Password) {
    return next(new ApiError(400, "MSNV và Password là bắt buộc"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const nhanVien = await nhanVienService.findByMSNV(MSNV);
    if (!nhanVien) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const isMatch = await bcrypt.compare(Password, nhanVien.Password);
    if (!isMatch) {
      return next(new ApiError(401, "Mật khẩu không đúng"));
    }

    const token = jwt.sign(
      { MSNV: nhanVien.MSNV, role: "nhanVien" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return res.send({
      message: "Đăng nhập thành công",
      token: token,
      role: "nhanVien",
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi đăng nhập: ${error.message}`)
    );
  }
};
