import "../models/connection.js";
import Config from "../models/Config.js";

export const getConfig = async (req, res, next) => {
  try {
    let cfg = await Config.findOne();
    if (!cfg) {
      cfg = await Config.create({});
    }
    res.json(cfg);
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req, res, next) => {
  try {
    let cfg = await Config.findOne();
    if (!cfg) {
      cfg = await Config.create(req.body);
    } else {
      cfg = await Config.findByIdAndUpdate(cfg._id, req.body, { new: true });
    }
    res.json(cfg);
  } catch (err) {
    next(err);
  }
};

export const createOrUpdateConfig = async (req, res, next) => {
  try {
    const cfg = await Config.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(cfg);
  } catch (err) {
    next(err);
  }
};
