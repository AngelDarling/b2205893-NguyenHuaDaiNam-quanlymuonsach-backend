const { ObjectId } = require("mongodb");

class DocGiaService {
  constructor(client) {
    this.DocGia = client.db().collection("docgia"); // Tên collection là "docgia"
  }

  // Extract DocGia data from payload
  extractDocGiaData(payload) {
    const docGia = {
      MaDocGia: payload.MaDocGia,
      HoLot: payload.HoLot,
      Ten: payload.Ten,
      NgaySinh: payload.NgaySinh,
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
      Password: payload.Password, // Thêm trường Password
    };
    // Remove undefined fields
    Object.keys(docGia).forEach(
      (key) => docGia[key] === undefined && delete docGia[key]
    );
    return docGia;
  }

  async create(payload) {
    const docGia = this.extractDocGiaData(payload);
    const result = await this.DocGia.findOneAndUpdate(
      { MaDocGia: docGia.MaDocGia }, // Đảm bảo MaDocGia là duy nhất
      { $set: docGia },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.DocGia.find(filter);
    return await cursor.toArray();
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
