const TheoDoiMuonSach = require("../services/TheoDoiMuonSach");

exports.getAllTheoDoiMuonSach = async (req, res) => {
  try {
    const theoDoiMuonSach = await TheoDoiMuonSach.find()
      .populate("MaDocGia")
      .populate("MaSach");
    res.json(theoDoiMuonSach);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createTheoDoiMuonSach = async (req, res) => {
  const { MaDocGia, MaSach, NgayMuon, NgayTra } = req.body;
  try {
    const theoDoiMuonSach = new TheoDoiMuonSach({
      MaDocGia,
      MaSach,
      NgayMuon,
      NgayTra,
    });
    await theoDoiMuonSach.save();
    res.status(201).json(theoDoiMuonSach);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi thêm bản ghi mượn sách" });
  }
};

exports.updateTheoDoiMuonSach = async (req, res) => {
  try {
    const theoDoiMuonSach = await TheoDoiMuonSach.findById(req.params.id);
    if (!theoDoiMuonSach)
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi mượn sách" });

    Object.assign(theoDoiMuonSach, req.body);
    await theoDoiMuonSach.save();
    res.json(theoDoiMuonSach);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi cập nhật bản ghi mượn sách" });
  }
};

exports.deleteTheoDoiMuonSach = async (req, res) => {
  try {
    const theoDoiMuonSach = await TheoDoiMuonSach.findById(req.params.id);
    if (!theoDoiMuonSach)
      return res
        .status(404)
        .json({ message: "Không tìm thấy bản ghi mượn sách" });

    await theoDoiMuonSach.remove();
    res.json({ message: "Xóa bản ghi mượn sách thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
