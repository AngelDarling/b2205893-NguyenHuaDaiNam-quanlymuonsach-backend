// services/theoDoiMuonSach.service.js
const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
  constructor(client) {
    this.TheoDoiMuonSach = client.db().collection("theodoimuonsachs");
  }

  extractTheoDoiMuonSachData(payload) {
    const theoDoiMuonSach = {
      MaDocGia: payload.MaDocGia,
      MaSach: payload.MaSach,
      NgayMuon: payload.NgayMuon ? new Date(payload.NgayMuon) : undefined,
      NgayTra: payload.NgayTra ? new Date(payload.NgayTra) : undefined,
      SoLuong: payload.SoLuong || 1, // Thêm số lượng mượn
      DaTra: payload.DaTra !== undefined ? payload.DaTra : false, // Mặc định là false
    };
    Object.keys(theoDoiMuonSach).forEach(
      (key) => theoDoiMuonSach[key] === undefined && delete theoDoiMuonSach[key]
    );
    return theoDoiMuonSach;
  }

  async create(payload) {
    const theoDoiMuonSach = this.extractTheoDoiMuonSachData(payload);
    const result = await this.TheoDoiMuonSach.insertOne(theoDoiMuonSach);
    return { ...theoDoiMuonSach, _id: result.insertedId };
  }

  async find(filter, options = {}) {
    const { search, page = 1, limit = 10 } = options;

    let query = filter || {};
    if (search) {
      query.MaDocGia = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: query },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "docGias",
          localField: "MaDocGia",
          foreignField: "MaDocGia",
          as: "docGia",
        },
      },
      { $unwind: { path: "$docGia", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "sachs",
          localField: "MaSach",
          foreignField: "MaSach",
          as: "sach",
        },
      },
      { $unwind: { path: "$sach", preserveNullAndEmptyArrays: true } },
    ];

    const theoDoiMuonSachs =
      await this.TheoDoiMuonSach.aggregate(pipeline).toArray();

    const total = await this.TheoDoiMuonSach.countDocuments(query);

    return {
      theoDoiMuonSachs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll() {
    try {
      const cursor = await this.TheoDoiMuonSach.find({});
      const result = await cursor.toArray();
      console.log("Kết quả từ findAll:", result); // Debug
      return result;
    } catch (error) {
      console.error("Lỗi khi tìm tất cả bản ghi mượn sách:", error);
      return [];
    }
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

  async checkAndReturnOverdueBooks() {
    const currentDate = new Date();
    const sachService = new SachService(MongoDB.client); // Tạo instance của SachService

    // Tìm các bản ghi mượn sách đã qua ngày trả nhưng chưa được trả
    const overdueRecords = await this.TheoDoiMuonSach.find({
      NgayTra: { $ne: null, $lt: currentDate }, // Ngày trả đã qua
      $or: [
        { NgayTra: { $exists: false } }, // Chưa trả
        { NgayTra: null },
      ],
    }).toArray();

    for (const record of overdueRecords) {
      // Tìm sách tương ứng
      const sach = await sachService.findOne({ MaSach: record.MaSach });
      if (sach) {
        // Tăng số lượng sách
        await sachService.update(sach._id, {
          ...sach,
          SoQuyen: sach.SoQuyen + record.SoLuong,
        });

        // Cập nhật bản ghi mượn sách (đánh dấu là đã trả)
        await this.update(record._id, {
          ...record,
          NgayTra: new Date(), // Đánh dấu ngày trả là ngày hiện tại
        });
      }
    }

    return overdueRecords.length; // Trả về số lượng bản ghi đã xử lý
  }
}

module.exports = TheoDoiMuonSachService;
