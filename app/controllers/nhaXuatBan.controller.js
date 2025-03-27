// controllers/nhaXuatBan.controller.js
const NhaXuatBanService = require("../services/nhaXuatBan.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MaNXB) {
    return next(new ApiError(400, "MaNXB không được để trống"));
  }

  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const existingNhaXuatBan = await nhaXuatBanService.findByMaNXB(
      req.body.MaNXB
    );
    if (existingNhaXuatBan) {
      return next(new ApiError(400, "MaNXB đã tồn tại"));
    }
    const document = await nhaXuatBanService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo nhà xuất bản:", error);
    if (error.code === 11000) {
      return next(new ApiError(400, "MaNXB đã tồn tại"));
    }
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi tạo nhà xuất bản: ${error.message}`)
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const { search, page, limit } = req.query;
    const result = await nhaXuatBanService.find({}, { search, page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhà xuất bản:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi lấy danh sách nhà xuất bản: ${error.message}`
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy nhà xuất bản:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy nhà xuất bản với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật nhà xuất bản:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật nhà xuất bản với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send({ message: "Nhà xuất bản đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa nhà xuất bản:", error);
    return next(
      new ApiError(
        500,
        `Không thể xóa nhà xuất bản với id=${req.params.id}: ${error.message}`
      )
    );
  }
};
