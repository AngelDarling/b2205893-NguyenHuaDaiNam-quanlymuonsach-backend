const NhaXuatBan = require("../models/NhaXuatBan");

exports.getAllNhaXuatBan = async (req, res) => {
  try {
    const nhaXuatBan = await NhaXuatBan.find();
    res.json(nhaXuatBan);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createNhaXuatBan = async (req, res) => {
  const { MaNXB, TenNXB, DiaChi } = req.body;
  try {
    const nhaXuatBan = new NhaXuatBan({ MaNXB, TenNXB, DiaChi });
    await nhaXuatBan.save();
    res.status(201).json(nhaXuatBan);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi thêm nhà xuất bản" });
  }
};

exports.updateNhaXuatBan = async (req, res) => {
  try {
    const nhaXuatBan = await NhaXuatBan.findById(req.params.id);
    if (!nhaXuatBan)
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });

    Object.assign(nhaXuatBan, req.body);
    await nhaXuatBan.save();
    res.json(nhaXuatBan);
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi cập nhật nhà xuất bản" });
  }
};

exports.deleteNhaXuatBan = async (req, res) => {
  try {
    const nhaXuatBan = await NhaXuatBan.findById(req.params.id);
    if (!nhaXuatBan)
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản" });

    await nhaXuatBan.remove();
    res.json({ message: "Xóa nhà xuất bản thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
