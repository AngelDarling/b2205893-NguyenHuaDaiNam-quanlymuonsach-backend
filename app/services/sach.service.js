const { ObjectId } = require("mongodb");

class SachService {
  constructor(client) {
    this.Sach = client.db().collection("sachs"); // Tên collection là "sachs"
  }

  // Extract Sach data from payload
  extractSachData(payload) {
    const sach = {
      MaSach: payload.MaSach,
      TenSach: payload.TenSach,
      DonGia: payload.DonGia,
      SoQuyen: payload.SoQuyen,
      NamXuatBan: payload.NamXuatBan,
      MaNXB: payload.MaNXB,
      NguonGocTacGia: payload.NguonGocTacGia,
    };
    // Remove undefined fields
    Object.keys(sach).forEach(
      (key) => sach[key] === undefined && delete sach[key]
    );
    return sach;
  }

  async create(payload) {
    const sach = this.extractSachData(payload);
    const result = await this.Sach.findOneAndUpdate(
      { MaSach: sach.MaSach }, // Đảm bảo MaSach là duy nhất
      { $set: sach },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Sach.find(filter);
    return await cursor.toArray();
  }

  async findByName(TenSach) {
    return await this.find({
      TenSach: { $regex: new RegExp(TenSach), $options: "i" },
    });
  }

  async findById(id) {
    return await this.Sach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractSachData(payload);
    const result = await this.Sach.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.Sach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = SachService;
