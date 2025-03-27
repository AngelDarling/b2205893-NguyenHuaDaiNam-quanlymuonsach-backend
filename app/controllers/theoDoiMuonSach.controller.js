// controllers/theoDoiMuonSach.controller.js
const TheoDoiMuonSachService = require("../services/theoDoiMuonSach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const SachService = require("../services/sach.service");
exports.create = async (req, res, next) => {
  if (!req.body?.MaDocGia || !req.body?.MaSach) {
    return next(new ApiError(400, "MaDocGia và MaSach không được để trống"));
  }

  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);

    // Tìm sách để kiểm tra số lượng
    const sach = await sachService.findOne({ MaSach: req.body.MaSach });
    if (!sach) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    const soLuongMuon = req.body.SoLuong || 1;
    if (soLuongMuon > sach.SoQuyen) {
      return next(
        new ApiError(400, "Số lượng mượn vượt quá số lượng sách hiện có")
      );
    }
    const document = await theoDoiMuonSachService.create(req.body);
    // Giảm số lượng sách
    await sachService.update(sach._id, {
      ...sach,
      SoQuyen: sach.SoQuyen - soLuongMuon,
    });
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi tạo bản ghi mượn sách:", error);
    return next(new ApiError(500, `Đã xảy ra lỗi khi tạo bản ghi mượn sách: ${error.message}`));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const { search, page, limit } = req.query;
    const result = await theoDoiMuonSachService.find({}, { search, page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bản ghi mượn sách:", error);
    return next(new ApiError(500, `Đã xảy ra lỗi khi lấy danh sách bản ghi mượn sách: ${error.message}`));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy bản ghi mượn sách:", error);
    return next(new ApiError(500, `Lỗi khi lấy bản ghi mượn sách với id=${req.params.id}: ${error.message}`));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật bản ghi mượn sách:", error);
    return next(new ApiError(500, `Lỗi khi cập nhật bản ghi mượn sách với id=${req.params.id}: ${error.message}`));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);

    // Lấy bản ghi mượn sách trước khi xóa
    const muonSach = await theoDoiMuonSachService.findById(req.params.id);
    if (!muonSach) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }

    // Xóa bản ghi mượn sách
    const document = await theoDoiMuonSachService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }

    // Chỉ tăng số lượng sách nếu DaTra là false
    if (!muonSach.DaTra) {
      // Tìm sách để tăng số lượng
      const sach = await sachService.findOne({ MaSach: muonSach.MaSach });
      if (!sach) {
        return next(new ApiError(404, "Không tìm thấy sách"));
      }

      // Tăng số lượng sách
      await sachService.update(sach._id, {
        ...sach,
        SoQuyen: sach.SoQuyen + muonSach.SoLuong,
      });
    }

    return res.send({ message: "Bản ghi mượn sách đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bản ghi mượn sách:", error);
    return next(
      new ApiError(500, `Không thể xóa bản ghi mượn sách với id=${req.params.id}: ${error.message}`)
    );
  }
};

// Thêm endpoint để lấy thống kê mượn sách
// controllers/theoDoiMuonSach.controller.js
// controllers/theoDoiMuonSach.controller.js
exports.getStatistics = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);

    // Lấy tất cả bản ghi mượn sách
    const muonSachList = await theoDoiMuonSachService.findAll();

    // Kiểm tra và đảm bảo muonSachList là mảng
    const muonSachListSafe = Array.isArray(muonSachList) ? muonSachList : [];
    console.log("muonSachList:", muonSachListSafe); // Debug để kiểm tra dữ liệu

    // Ngày hiện tại
    const ngayHienTai = new Date();

    // Tính toán các giá trị
    let total = muonSachListSafe.length;
    let daTra = 0;
    let chuaTra = 0;
    let quaHan = 0;

    muonSachListSafe.forEach((muonSach) => {
      const ngayTra = new Date(muonSach.NgayTra);

      if (muonSach.DaTra) {
        // Nếu DaTra là true, tăng số sách đã trả
        daTra += muonSach.SoLuong;
      } else {
        // Nếu DaTra là false, kiểm tra ngày trả
        if (ngayTra > ngayHienTai) {
          // Ngày trả lớn hơn ngày hiện tại: Chưa trả
          chuaTra += muonSach.SoLuong;
        } else {
          // Ngày trả nhỏ hơn hoặc bằng ngày hiện tại: Quá hạn
          quaHan += muonSach.SoLuong;
        }
      }
    });

    return res.send({
      total,
      daTra,
      chuaTra,
      quaHan,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê mượn sách:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thống kê mượn sách"));
  }
};

exports.checkOverdueBooks = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const processedCount =
      await theoDoiMuonSachService.checkAndReturnOverdueBooks();
    return res.send({
      message: `Đã xử lý ${processedCount} bản ghi mượn sách quá hạn.`,
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra bản ghi mượn sách quá hạn:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi kiểm tra bản ghi mượn sách quá hạn: ${error.message}`
      )
    );
  }
};

exports.markReturned = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);

    const muonSach = await theoDoiMuonSachService.findById(req.params.id);
    if (!muonSach) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }

    // Kiểm tra xem bản ghi đã được đánh dấu là đã trả chưa
    if (muonSach.DaTra) {
      return next(new ApiError(400, "Bản ghi này đã được đánh dấu là đã trả"));
    }

    const sach = await sachService.findOne({ MaSach: muonSach.MaSach });
    if (!sach) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    // Cập nhật bản ghi mượn sách: đặt DaTra là true
    const updatedMuonSach = await theoDoiMuonSachService.update(req.params.id, {
      ...muonSach,
      DaTra: true,
    });

    // Tăng số lượng sách
    await sachService.update(sach._id, {
      ...sach,
      SoQuyen: sach.SoQuyen + muonSach.SoLuong,
    });

    return res.send({
      message: "Bản ghi mượn sách đã được đánh dấu là đã trả",
      muonSach: updatedMuonSach,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu bản ghi mượn sách là đã trả:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi đánh dấu bản ghi mượn sách là đã trả với id=${req.params.id}: ${error.message}`
      )
    );
  }
};