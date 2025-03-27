const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Tạo sách mới
exports.create = async (req, res, next) => {
  if (!req.body?.MaSach) {
    return next(new ApiError(400, "MaSach không được để trống"));
  }
  if (!req.body?.TenSach) {
    return next(new ApiError(400, "Tên sách không được để trống"));
  }
  if (!req.body?.DonGia || req.body.DonGia <= 0) {
    return next(new ApiError(400, "Đơn giá phải lớn hơn 0"));
  }
  if (!req.body?.SoQuyen || req.body.SoQuyen < 0) {
    return next(new ApiError(400, "Số quyển không được nhỏ hơn 0"));
  }
  if (
    !req.body?.NamXuatBan ||
    req.body.NamXuatBan < 1900 ||
    req.body.NamXuatBan > new Date().getFullYear()
  ) {
    return next(
      new ApiError(
        400,
        `Năm xuất bản phải từ 1900 đến ${new Date().getFullYear()}`
      )
    );
  }
  if (!req.body?.MaNXB) {
    return next(new ApiError(400, "Mã nhà xuất bản không được để trống"));
  }
  if (!req.body?.TacGia) {
    return next(new ApiError(400, "Tác giả không được để trống"));
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const existingSach = await sachService.findByMaSach(req.body.MaSach);
    if (existingSach) {
      return next(new ApiError(400, "Mã sách đã tồn tại"));
    }
    const document = await sachService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo sách:", error);
    if (error.code === 11000) {
      return next(new ApiError(400, "Mã sách đã tồn tại"));
    }
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi tạo sách: ${error.message}`)
    );
  }
};

// Lấy danh sách sách (hỗ trợ tìm kiếm và phân trang)
exports.find = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const { search, maNXB, page, limit } = req.query; // Thêm maNXB
    const result = await sachService.find({}, { search, maNXB, page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sách:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi lấy danh sách sách: ${error.message}`
      )
    );
  }
};

// Lấy sách theo ID
exports.findById = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy sách:", error);
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi lấy sách: ${error.message}`)
    );
  }
};

// Cập nhật sách
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật sách:", error);
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi cập nhật sách: ${error.message}`)
    );
  }
};

// Xóa sách
exports.delete = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send({ message: "Sách đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa sách:", error);
    return next(
      new ApiError(500, `Đã xảy ra lỗi khi xóa sách: ${error.message}`)
    );
  }
};
