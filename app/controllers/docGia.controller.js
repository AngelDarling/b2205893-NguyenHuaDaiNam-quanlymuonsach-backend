const DocGiaService = require("../services/docGia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.MaDocGia || !req.body?.Password) {
    return next(new ApiError(400, "MaDocGia and Password can not be empty"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const existingDocGia = await docGiaService.findByMaDocGia(
      req.body.MaDocGia
    );
    if (existingDocGia) {
      return next(new ApiError(400, "MaDocGia already exists"));
    }
    const document = await docGiaService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the docgia")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const { Ten } = req.query;
    if (Ten) {
      documents = await docGiaService.findByName(Ten);
    } else {
      documents = await docGiaService.find({});
    }
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving docgia"));
  }

  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "DocGia not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving docgia with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "DocGia not found"));
    }
    return res.send({ message: "DocGia was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating docgia with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "DocGia not found"));
    }
    return res.send({ message: "DocGia was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete docgia with id=${req.params.id}`)
    );
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ApiError(400, "Username and password are required"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.findByMaDocGia(username);
    if (!docGia) {
      return next(new ApiError(404, "DocGia not found"));
    }
    if (docGia.Password !== password) {
      return next(new ApiError(401, "Invalid password"));
    }
    return res.send({
      message: "Login successful",
      user: docGia,
      role: "docgia",
    });
  } catch (error) {
    return next(new ApiError(500, "An error occurred while logging in"));
  }
};
