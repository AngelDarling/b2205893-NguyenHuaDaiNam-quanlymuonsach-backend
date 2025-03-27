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

    // Kiểm tra vai trò người dùng
    const role = req.user?.role;
    if (!role) {
      return next(
        new ApiError(401, "Token không hợp lệ: Thiếu thông tin role")
      );
    }

    // Nếu là độc giả, kiểm tra MaDocGia
    if (role === "docGia") {
      const maDocGia = req.user?.MaDocGia;
      if (!maDocGia) {
        return next(
          new ApiError(401, "Token không hợp lệ: Thiếu thông tin MaDocGia")
        );
      }
      if (req.body.MaDocGia !== maDocGia) {
        return next(
          new ApiError(403, "Bạn chỉ có thể mượn sách cho chính mình.")
        );
      }
    }

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
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi tạo bản ghi mượn sách: ${error.message}`
      )
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const role = req.user?.role;
    if (!role) {
      return next(
        new ApiError(401, "Token không hợp lệ: Thiếu thông tin role")
      );
    }

    let query = {};
    const { search, page, limit } = req.query;

    // Nếu là độc giả, kiểm tra MaDocGia và chỉ lấy bản ghi của họ
    if (role === "docGia") {
      const maDocGia = req.user?.MaDocGia;
      if (!maDocGia) {
        return next(
          new ApiError(401, "Token không hợp lệ: Thiếu thông tin MaDocGia")
        );
      }
      query.MaDocGia = maDocGia;
    } else if (role === "nhanVien" && search) {
      // Nếu là nhân viên và có tham số search, tìm kiếm theo MaDocGia
      query.MaDocGia = { $regex: search, $options: "i" };
    }

    const result = await theoDoiMuonSachService.find(query, { page, limit });
    return res.send(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bản ghi mượn sách:", error);
    return next(
      new ApiError(
        500,
        `Đã xảy ra lỗi khi lấy danh sách bản ghi mượn sách: ${error.message}`
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const role = req.user?.role;
    if (!role) {
      return next(
        new ApiError(401, "Token không hợp lệ: Thiếu thông tin role")
      );
    }

    const document = await theoDoiMuonSachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }

    // Nếu là độc giả, kiểm tra MaDocGia và chỉ cho phép xem bản ghi của họ
    if (role === "docGia") {
      const maDocGia = req.user?.MaDocGia;
      if (!maDocGia) {
        return next(
          new ApiError(401, "Token không hợp lệ: Thiếu thông tin MaDocGia")
        );
      }
      if (document.MaDocGia !== maDocGia) {
        return next(
          new ApiError(403, "Bạn không có quyền xem bản ghi mượn sách này.")
        );
      }
    }

    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi lấy bản ghi mượn sách:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy bản ghi mượn sách với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.update(
      req.params.id,
      req.body
    );
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi mượn sách"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi cập nhật bản ghi mượn sách:", error);
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật bản ghi mượn sách với id=${req.params.id}: ${error.message}`
      )
    );
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
      new ApiError(
        500,
        `Không thể xóa bản ghi mượn sách với id=${req.params.id}: ${error.message}`
      )
    );
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const role = req.user?.role;
    if (!role) {
      return next(
        new ApiError(401, "Token không hợp lệ: Thiếu thông tin role")
      );
    }

    let muonSachList;
    if (role === "docGia") {
      const maDocGia = req.user?.MaDocGia;
      if (!maDocGia) {
        return next(
          new ApiError(401, "Token không hợp lệ: Thiếu thông tin MaDocGia")
        );
      }
      // Sử dụng find() với bộ lọc MaDocGia
      const result = await theoDoiMuonSachService.find({ MaDocGia: maDocGia });
      muonSachList = result.theoDoiMuonSachs || [];
    } else {
      // Sử dụng findAll() để lấy tất cả bản ghi
      muonSachList = await theoDoiMuonSachService.findAll();
    }

    console.log("muonSachList:", muonSachList);

    const ngayHienTai = new Date();

    let total = muonSachList.length;
    let daTra = 0;
    let chuaTra = 0;
    let quaHan = 0;

    muonSachList.forEach((muonSach) => {
      const ngayTra = new Date(muonSach.NgayTra);

      if (muonSach.DaTra) {
        daTra += muonSach.SoLuong;
      } else {
        if (ngayTra > ngayHienTai) {
          chuaTra += muonSach.SoLuong;
        } else {
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

    if (muonSach.DaTra) {
      return next(new ApiError(400, "Bản ghi này đã được đánh dấu là đã trả"));
    }

    const sach = await sachService.findOne({ MaSach: muonSach.MaSach });
    if (!sach) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    const updatedMuonSach = await theoDoiMuonSachService.update(req.params.id, {
      ...muonSach,
      DaTra: true,
    });

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
