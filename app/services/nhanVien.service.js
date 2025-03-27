// services/nhanVien.service.js
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class NhanVienService {
  constructor(client) {
    this.NhanVien = client.db().collection("nhanviens");
  }

  extractNhanVienData(payload) {
    const nhanVien = {
      MSNV: payload.MSNV,
      HoTenNV: payload.HoTenNV,
      Password: payload.Password,
      Chucvu: payload.Chucvu,
      Diachi: payload.Diachi,
      SoDienThoai: payload.SoDienThoai,
    };
    Object.keys(nhanVien).forEach(
      (key) => nhanVien[key] === undefined && delete nhanVien[key]
    );
    return nhanVien;
  }

  async create(payload) {
    const nhanVien = this.extractNhanVienData(payload);
    if (nhanVien.Password) {
      const saltRounds = 10;
      nhanVien.Password = await bcrypt.hash(nhanVien.Password, saltRounds);
    }
    const result = await this.NhanVien.insertOne(nhanVien); // Sử dụng insertOne thay vì findOneAndUpdate
    return { ...nhanVien, _id: result.insertedId };
  }

  async find(filter, options = {}) {
    const { search, page = 1, limit = 10 } = options;

    let query = filter || {};
    if (search) {
      query.HoTenNV = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }

    const skip = (page - 1) * limit;
    const cursor = await this.NhanVien.find(query)
      .skip(skip)
      .limit(Number(limit));
    const nhanViens = await cursor.toArray();

    const total = await this.NhanVien.countDocuments(query);

    return {
      nhanViens,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByName(HoTenNV) {
    return await this.find({
      HoTenNV: { $regex: new RegExp(HoTenNV), $options: "i" },
    });
  }

  async findById(id) {
    return await this.NhanVien.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByMSNV(MSNV) {
    return await this.NhanVien.findOne({
      MSNV: MSNV,
    });
  }

  // Thêm phương thức để lấy một tài khoản admin bất kỳ
  async findOneAdmin() {
    const admins = await this.NhanVien.find({ VaiTro: "nhanVien" }).toArray();
    if (admins.length === 0) return null;

    // Chọn ngẫu nhiên một tài khoản admin
    const randomIndex = Math.floor(Math.random() * admins.length);
    return admins[randomIndex];
  }
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractNhanVienData(payload);
    if (update.Password) {
      const saltRounds = 10;
      update.Password = await bcrypt.hash(update.Password, saltRounds);
    }
    const result = await this.NhanVien.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.NhanVien.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = NhanVienService;
