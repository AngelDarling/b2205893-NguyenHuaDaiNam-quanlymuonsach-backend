// services/sach.service.js
const { ObjectId } = require("mongodb");

class SachService {
  constructor(client) {
    this.Sach = client.db().collection("sachs");
    this.nhaXuatBan = client.db().collection("nhaxuatbans");
  }

  extractSachData(payload) {
    const sach = {
      MaSach: payload.MaSach,
      TenSach: payload.TenSach,
      DonGia: payload.DonGia,
      SoQuyen: payload.SoQuyen,
      NamXuatBan: payload.NamXuatBan,
      MaNXB: payload.MaNXB,
      TacGia: payload.TacGia,
    };
    Object.keys(sach).forEach(
      (key) => sach[key] === undefined && delete sach[key]
    );
    return sach;
  }

  async create(payload) {
    const sach = this.extractSachData(payload);
    const result = await this.Sach.insertOne(sach);
    return { ...sach, _id: result.insertedId };
  }

  async find(filter, options = {}) {
    const { search, maNXB, page = 1, limit = 10 } = options;

    let query = filter || {};
    if (search) {
      query.TenSach = { $regex: search, $options: "i" };
    }
    if (maNXB) {
      query.MaNXB = String(maNXB).trim();
    }
    // console.log("Query for filtering:", query); // Debug
    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: query },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "nhaxuatbans",
          localField: "MaNXB",
          foreignField: "MaNXB",
          as: "nhaXuatBan",
        },
      },
      { $unwind: { path: "$nhaXuatBan", preserveNullAndEmptyArrays: true } },
    ];

    const sachs = await this.Sach.aggregate(pipeline).toArray();
    const total = await this.Sach.countDocuments(query);
    // console.log("Filtered sachs:", sachs); // Debug
    return {
      sachs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByMaSach(MaSach) {
    const result = await this.find({ MaSach });
    return result.sachs[0] || null;
  }

  async findById(id) {
    const sach = await this.Sach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    if (sach && sach.MaNXB) {
      sach.nhaXuatBan = await this.NhaXuatBan.findOne({ MaNXB: sach.MaNXB });
    }
    return sach;
  }
  async findOne(filter) {
    const sach = await this.Sach.findOne(filter);
    if (sach && sach.MaNXB) {
      sach.nhaXuatBan = await this.nhaXuatBan.findOne({ MaNXB: sach.MaNXB });
    }
    return sach;
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
    if (result && result.MaNXB) {
      result.nhaXuatBan = await this.nhaXuatBan.findOne({
        MaNXB: result.MaNXB,
      });
    }
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
