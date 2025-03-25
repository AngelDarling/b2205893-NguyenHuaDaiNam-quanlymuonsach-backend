const TheoDoiMuonSachService = require("../services/theoDoiMuonSach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MaDocGia || !req.body?.MaSach) {
    return next(new ApiError(400, "MaDocGia and MaSach can not be empty"));
  }

  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the theoDoiMuonSach")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const { MaDocGia } = req.query;
    if (MaDocGia) {
      documents = await theoDoiMuonSachService.findByMaDocGia(MaDocGia);
    } else {
      documents = await theoDoiMuonSachService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving theoDoiMuonSach")
    );
  }

  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "TheoDoiMuonSach not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving theoDoiMuonSach with id=${req.params.id}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.update(
      req.params.id,
      req.body
    );
    if (!document) {
      return next(new ApiError(404, "TheoDoiMuonSach not found"));
    }
    return res.send({ message: "TheoDoiMuonSach was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating theoDoiMuonSach with id=${req.params.id}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "TheoDoiMuonSach not found"));
    }
    return res.send({ message: "TheoDoiMuonSach was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete theoDoiMuonSach with id=${req.params.id}`
      )
    );
  }
};
