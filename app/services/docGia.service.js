// services/docGia.service.js
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class DocGiaService {
  constructor(client) {
    this.DocGia = client.db().collection("docgias");
  }

  extractDocGiaData(payload) {
    const docGia = {
      MaDocGia: payload.MaDocGia,
      HoLot: payload.HoLot,
      Ten: payload.Ten,
      NgaySinh: payload.NgaySinh,
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
      Password: payload.Password,
    };
    Object.keys(docGia).forEach(
      (key) => docGia[key] === undefined && delete docGia[key]
    );
    return docGia;
  }

  async create(payload) {
    const docGia = this.extractDocGiaData(payload);
    if (docGia.Password) {
      const saltRounds = 10;
      docGia.Password = await bcrypt.hash(docGia.Password, saltRounds);
    }
    const result = await this.DocGia.insertOne(docGia); // Sử dụng insertOne thay vì findOneAndUpdate
    return { ...docGia, _id: result.insertedId };
  }

  async find(filter, options = {}) {
    const { search, page = 1, limit = 10 } = options;

    let query = filter || {};
    if (search) {
      query.Ten = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }

    const skip = (page - 1) * limit;
    const cursor = await this.DocGia.find(query)
      .skip(skip)
      .limit(Number(limit));
    const docGias = await cursor.toArray();

    const total = await this.DocGia.countDocuments(query);

    return {
      docGias,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByName(Ten) {
    return await this.find({
      Ten: { $regex: new RegExp(Ten), $options: "i" },
    });
  }

  async findById(id) {
    return await this.DocGia.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByMaDocGia(MaDocGia) {
    return await this.DocGia.findOne({
      MaDocGia: MaDocGia,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractDocGiaData(payload);
    if (update.Password) {
      const saltRounds = 10;
      update.Password = await bcrypt.hash(update.Password, saltRounds);
    }
    const result = await this.DocGia.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.DocGia.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = DocGiaService;
