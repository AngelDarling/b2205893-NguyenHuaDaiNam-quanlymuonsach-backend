// services/nhaXuatBan.service.js
const { ObjectId } = require("mongodb");

class NhaXuatBanService {
  constructor(client) {
    this.NhaXuatBan = client.db().collection("nhaxuatbans");
  }

  extractNhaXuatBanData(payload) {
    const nhaXuatBan = {
      MaNXB: payload.MaNXB,
      TenNXB: payload.TenNXB,
      DiaChi: payload.DiaChi,
    };
    Object.keys(nhaXuatBan).forEach(
      (key) => nhaXuatBan[key] === undefined && delete nhaXuatBan[key]
    );
    return nhaXuatBan;
  }

  async create(payload) {
    const nhaXuatBan = this.extractNhaXuatBanData(payload);
    const result = await this.NhaXuatBan.insertOne(nhaXuatBan);
    return { ...nhaXuatBan, _id: result.insertedId };
  }

  async find(filter, options = {}) {
    const { search, page = 1, limit = 10 } = options;

    let query = filter || {};
    if (search) {
      query.TenNXB = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }

    const skip = (page - 1) * limit;
    const cursor = await this.NhaXuatBan.find(query)
      .skip(skip)
      .limit(Number(limit));
    const nhaXuatBans = await cursor.toArray();

    const total = await this.NhaXuatBan.countDocuments(query);

    return {
      nhaXuatBans,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id) {
    return await this.NhaXuatBan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByMaNXB(MaNXB) {
    return await this.NhaXuatBan.findOne({
      MaNXB: MaNXB,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractNhaXuatBanData(payload);
    const result = await this.NhaXuatBan.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.NhaXuatBan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = NhaXuatBanService;
