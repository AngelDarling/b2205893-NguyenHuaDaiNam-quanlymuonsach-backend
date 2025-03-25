const NhaXuatBanService = require("../services/nhaXuatBan.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.TenNXB) {
    return next(new ApiError(400, "TenNXB can not be empty"));
  }

  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the nhaXuatBan")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const { TenNXB } = req.query;
    if (TenNXB) {
      documents = await nhaXuatBanService.findByName(TenNXB);
    } else {
      documents = await nhaXuatBanService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving nhaXuatBan")
    );
  }

  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "NhaXuatBan not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving nhaXuatBan with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "NhaXuatBan not found"));
    }
    return res.send({ message: "NhaXuatBan was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating nhaXuatBan with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const document = await nhaXuatBanService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "NhaXuatBan not found"));
    }
    return res.send({ message: "NhaXuatBan was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete nhaXuatBan with id=${req.params.id}`)
    );
  }
};
