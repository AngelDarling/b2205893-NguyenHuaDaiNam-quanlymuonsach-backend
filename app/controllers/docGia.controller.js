// controllers/docGia.controller.js
const DocGiaService = require("../services/docGia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.create = async (req, res, next) => {
  if (!req.body?.MaDocGia || !req.body?.Password) {
    return next(new ApiError(400, "MaDocGia và Password không được để trống"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const existingDocGia = await docGiaService.findByMaDocGia(
      req.body.MaDocGia
    );
    if (existingDocGia) {
      return next(new ApiError(400, "MaDocGia đã tồn tại"));
    }
    const document = await docGiaService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo độc giả:", error);
    if (error.code === 11000) {
      return next(new ApiError(400, "MaDocGia đã tồn tại"));
    }
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi tạo độc giả: ${error.message}`)
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const { search, page, limit } = req.query;
    const result = await docGiaService.find({}, { search, page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách độc giả:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi lấy danh sách độc giả: ${error.message}`
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy độc giả:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy độc giả với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật độc giả:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật độc giả với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }
    return res.send({ message: "Độc giả đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa độc giả:", error);
    return next(
      new ApiError(
        500,
        `Không thể xóa độc giả với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.login = async (req, res, next) => {
  const { MaDocGia, Password } = req.body;

  if (!MaDocGia || !Password) {
    return next(new ApiError(400, "MaDocGia và Password là bắt buộc"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.findByMaDocGia(MaDocGia);
    if (!docGia) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    const isMatch = await bcrypt.compare(Password, docGia.Password);
    if (!isMatch) {
      return next(new ApiError(401, "Mật khẩu không đúng"));
    }

    const token = jwt.sign(
      { MaDocGia: docGia.MaDocGia, role: "docGia" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return res.send({
      message: "Đăng nhập thành công",
      token: token,
      role: "docGia",
      maDocGia: docGia.MaDocGia,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi đăng nhập: ${error.message}`)
    );
  }
};
