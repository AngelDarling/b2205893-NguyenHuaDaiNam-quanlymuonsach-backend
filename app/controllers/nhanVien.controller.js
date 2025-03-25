const NhanVienService = require("../services/nhanVien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MSNV || !req.body?.Password) {
    return next(new ApiError(400, "MSNV and Password can not be empty"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const existingNhanVien = await nhanVienService.findByMSNV(req.body.MSNV);
    if (existingNhanVien) {
      return next(new ApiError(400, "MSNV already exists"));
    }
    const document = await nhanVienService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the nhanVien")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const { HoTenNV } = req.query;
    if (HoTenNV) {
      documents = await nhanVienService.findByName(HoTenNV);
    } else {
      documents = await nhanVienService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving nhanVien")
    );
  }

  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "NhanVien not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving nhanVien with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "NhanVien not found"));
    }
    return res.send({ message: "NhanVien was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating nhanVien with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "NhanVien not found"));
    }
    return res.send({ message: "NhanVien was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete nhanVien with id=${req.params.id}`)
    );
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ApiError(400, "Username and password are required"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const nhanVien = await nhanVienService.findByMSNV(username);
    if (!nhanVien) {
      return next(new ApiError(404, "NhanVien not found"));
    }
    if (nhanVien.Password !== password) {
      return next(new ApiError(401, "Invalid password"));
    }
    return res.send({
      message: "Login successful",
      user: nhanVien,
      role: "nhanvien",
    });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while logging in"));
  }
};
