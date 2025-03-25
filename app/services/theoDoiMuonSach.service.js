const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
  constructor(client) {
    this.TheoDoiMuonSach = client.db().collection("theodoimuonsach");
  }

  extractTheoDoiMuonSachData(payload) {
    const theoDoiMuonSach = {
      MaDocGia: payload.MaDocGia,
      MaSach: payload.MaSach,
      NgayMuon: payload.NgayMuon,
      NgayTra: payload.NgayTra,
    };
    Object.keys(theoDoiMuonSach).forEach(
      (key) => theoDoiMuonSach[key] === undefined && delete theoDoiMuonSach[key]
    );
    return theoDoiMuonSach;
  }

  async create(payload) {
    const theoDoiMuonSach = this.extractTheoDoiMuonSachData(payload);
    const result = await this.TheoDoiMuonSach.insertOne(theoDoiMuonSach);
    return result;
  }

  async find(filter) {
    const cursor = await this.TheoDoiMuonSach.find(filter);
    return await cursor.toArray();
  }

  async findByMaDocGia(MaDocGia) {
    return await this.find({
      MaDocGia: MaDocGia,
    });
  }

  async findById(id) {
    return await this.TheoDoiMuonSach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractTheoDoiMuonSachData(payload);
    const result = await this.TheoDoiMuonSach.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.TheoDoiMuonSach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = TheoDoiMuonSachService;
