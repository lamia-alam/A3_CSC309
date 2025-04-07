const prisma = require("../prisma/prisma_client");

const { Role } = require("@prisma/client");

const PromotionType = ["one-time", "automatic"];

const createPromotion = async (req, res) => {
  console.log("createPromotion called, req.body:", req.body);
  const {
    name,
    description,
    type,
    startTime,
    endTime,
    minSpending,
    rate,
    points,
  } = req.body;

  if (!name || !description || !type || !startTime || !endTime) {
    console.log("createPromotion", 400, "Missing required fields", req.body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!PromotionType.includes(type)) {
    console.log("createPromotion", 400, "Invalid promotion type", req.body);
    return res.status(400).json({ error: "Invalid promotion type" });
  }

  const startTimeDate = new Date(startTime);
  const endTimeDate = new Date(endTime);

  if (startTimeDate > endTimeDate) {
    console.log(
      "createPromotion",
      400,
      "Start time must be before end time",
      req.body
    );
    return res
      .status(400)
      .json({ error: "Start time must be before end time" });
  }

  if (
    minSpending &&
    (isNaN(parseFloat(minSpending)) || parseFloat(minSpending) < 0)
  ) {
    console.log("createPromotion", 400, "Invalid min spending", req.body);
    return res.status(400).json({ error: "Invalid min spending" });
  }

  if (rate && (isNaN(parseFloat(rate)) || parseFloat(rate) < 0)) {
    console.log("createPromotion", 400, "Invalid rate", req.body);
    return res.status(400).json({ error: "Invalid rate" });
  }

  if (points && (isNaN(parseInt(points, 10)) || parseInt(points, 10) < 0)) {
    console.log("createPromotion", 400, "Invalid points", req.body);
    return res.status(400).json({ error: "Invalid points" });
  }

  try {
    const data = {
      name,
      description,
      type,
      startTime: startTimeDate,
      endTime: endTimeDate,
      minSpending: minSpending ? parseFloat(minSpending) : 0,
      rate: rate ? parseFloat(rate) : 0,
      points: points ? parseInt(points, 10) : 0,
    };

    const promotion = await prisma.promotion.create({
      data,
    });

    res.status(201).json(promotion);
  } catch (error) {
    console.log("🚀 ~ createPromotion ~ error:", error);
    console.log("Request body:", req.body);
    res.status(500).json({ error: error.message });
  }
};

const getPromotions = async (req, res) => {
  console.log("getPromotions called");
  const { name, type, description, minSpending, rate, points, page = 1, limit = 10, started, ended } = req.query;

  const isManagerOrSuperuser = [Role.manager, Role.superuser].includes(
    req.user.role
  );

  const pageInt = parseInt(page, 10);
  const limitInt = parseInt(limit, 10);

  if (pageInt < 1 || limitInt < 1) {
    console.log(
      "getPromotions",
      400,
      "Page and limit must be positive integers",
      req.query
    );
    return res
      .status(400)
      .json({ error: "Page and limit must be positive integers" });
  }

  const validBooleanValues = ["true", "false"];

  if ((started !== undefined || ended !== undefined) && !isManagerOrSuperuser) {
    console.log("getPromotions", 403, "Forbidden", req.query);
    return res.status(403).json({ error: "Forbidden" });
  }

  if (started && !validBooleanValues.includes(started)) {
    console.log("getPromotions", 400, "Invalid value for started", req.query);
    return res
      .status(400)
      .json({ error: "Invalid value for started. Use 'true' or 'false'." });
  }

  if (ended && !validBooleanValues.includes(ended)) {
    console.log("getPromotions", 400, "Invalid value for ended", req.query);
    return res
      .status(400)
      .json({ error: "Invalid value for ended. Use 'true' or 'false'." });
  }

  if (started && ended) {
    console.log(
      "getPromotions",
      400,
      "Cannot have both started and ended together",
      req.query
    );
    return res
      .status(400)
      .json({ error: "Cannot have both started and ended together." });
  }

  if (type && !Object.values(PromotionType).includes(type)) {
    console.log("getPromotions", 400, "Invalid promotion type", req.query);
    return res.status(400).json({ error: "Invalid promotion type" });
  }

  try {
    const where = {};

    if (name) where.name = name;
    if (type) where.type = type;
    if (description) where.description = description;
    if (minSpending) where.minSpending = Number(minSpending);
    if (rate) where.rate = Number(rate);
    if (points) where.points = Number(points);

    if (isManagerOrSuperuser) {
      if (started === "true") where.startTime = { lte: new Date() };
      if (ended === "true") where.endTime = { lte: new Date() };
      if (started === "false") where.startTime = { gt: new Date() };
      if (ended === "false") where.endTime = { gt: new Date() };
    } else {
      where.startTime = { lte: new Date() };
      where.endTime = { gt: new Date() };
    }
    const promotions = await prisma.promotion.findMany({
      where,
      skip: (pageInt - 1) * limitInt,
      take: limitInt,
    });

    const totalPromos = await prisma.promotion.count({where: where});

    return res.json({
      count: totalPromos,
      results: promotions.map((promotion) => ({
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        endTime: promotion.endTime,
        minSpending: promotion.minSpending,
        rate: promotion.rate,
        points: promotion.points,
        ...(isManagerOrSuperuser && {
          startTime: promotion.startTime,
        }),
      })),
    });
  } catch (error) {
    console.log("🚀 ~ getPromotions ~ error:", error);
    console.log("Request query:", req.query);
    return res.status(500).json({ error: error.message });
  }
};

const getPromotionById = async (req, res) => {
  console.log("getPromotionById called");
  const { promotionId } = req.params;

  if (isNaN(parseInt(promotionId, 10))) {
    console.log("getPromotionById", 400, "Invalid promotion ID", req.params);
    return res.status(400).json({ error: "Invalid promotion ID" });
  }

  const isManagerOrSuperuser = [Role.manager, Role.superuser].includes(
    req.user.role
  );

  try {
    const promotion = await prisma.promotion.findUnique({
      where: {
        id: parseInt(promotionId, 10),
        ...(!isManagerOrSuperuser && {
          startTime: { lte: new Date() },
          endTime: { gt: new Date() },
        }),
      },
    });

    if (!promotion) {
      console.log("getPromotionById", 404, "Promotion not found", req.params);
      return res.status(404).json({ error: "Promotion not found" });
    }

    return res.json({
      id: promotion.id,
      name: promotion.name,
      type: promotion.type,
      description: promotion.description,
      endTime: promotion.endTime,
      ...(isManagerOrSuperuser && { startTime: promotion.startTime }),
      minSpending: promotion.minSpending,
      rate: promotion.rate,
      points: promotion.points,
    });
  } catch (error) {
    console.log("🚀 ~ getPromotionById ~ error:", error);
    console.log("Request params:", req.params);
    return res.status(500).json({ error: error.message });
  }
};

const updatePromotion = async (req, res) => {
  console.log("updatePromotion called");
  const { promotionId } = req.params;
  const {
    name,
    description,
    type,
    startTime,
    endTime,
    minSpending,
    rate,
    points,
  } = req.body;

  if (type && !Object.values(PromotionType).includes(type)) {
    console.log(
      "updatePromotion",
      400,
      "Invalid promotion type",
      "body:",
      req.body,
      "params:",
      req.params
    );
    return res.status(400).json({ error: "Invalid promotion type" });
  }

  const promotion = await prisma.promotion.findUnique({
    where: {
      id: parseInt(promotionId, 10),
    },
  });

  if (!promotion) {
    console.log(
      "updatePromotion",
      404,
      "Promotion not found",
      "body:",
      req.body,
      "params:",
      req.params
    );
    return res.status(404).json({ error: "Promotion not found" });
  }

  if (endTime && promotion.endTime < new Date()) {
    console.log(
      "updatePromotion",
      400,
      "Cannot update endTime of a promotion that is already ended",
      "body:",
      req.body,
      "params:",
      req.params
    );
    return res.status(400).json({
      error: "Cannot update endTime of a promotion that is already ended",
    });
  }

  if (
    new Date() > promotion.startTime &&
    (name || description || type || startTime || minSpending || rate || points)
  ) {
    console.log(
      "updatePromotion",
      400,
      "Cannot update promotion details after the original start time has passed",
      "body:",
      req.body,
      "params:",
      req.params
    );
    return res.status(400).json({
      error:
        "Cannot update promotion details after the original start time has passed",
    });
  }

  const data = {};

  if (name) data.name = name;
  if (description) data.description = description;
  if (type) data.type = type;

  if (startTime) {
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
      console.log(
        "updatePromotion",
        400,
        "Invalid start time format",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "Invalid start time format" });
    }
    if (startTimeDate < new Date()) {
      console.log(
        "updatePromotion",
        400,
        "Start time cannot be in the past",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res
        .status(400)
        .json({ error: "Start time cannot be in the past" });
    }
    data.startTime = startTimeDate;
  }

  if (endTime) {
    const endTimeDate = new Date(endTime);
    if (isNaN(endTimeDate.getTime())) {
      console.log(
        "updatePromotion",
        400,
        "Invalid end time format",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "Invalid end time format" });
    }
    if (endTimeDate < new Date()) {
      console.log(
        "updatePromotion",
        400,
        "End time cannot be in the past",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "End time cannot be in the past" });
    }
    data.endTime = endTimeDate;
  }

  if (startTime && endTime && data.startTime > data.endTime) {
    console.log(
      "updatePromotion",
      400,
      "Start time must be before end time",
      "body:",
      req.body,
      "params:",
      req.params
    );
    return res
      .status(400)
      .json({ error: "Start time must be before end time" });
  }

  if (minSpending) {
    if (isNaN(parseFloat(minSpending)) || parseFloat(minSpending) <= 0) {
      console.log(
        "updatePromotion",
        400,
        "Invalid min spending",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "Invalid min spending" });
    }
    data.minSpending = parseFloat(minSpending);
  }

  if (rate) {
    if (isNaN(parseFloat(rate)) || parseFloat(rate) < 0) {
      console.log(
        "updatePromotion",
        400,
        "Invalid rate",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "Invalid rate" });
    }
    data.rate = parseFloat(rate);
  }

  if (points) {
    if (isNaN(parseInt(points, 10)) || parseInt(points, 10) < 0) {
      console.log(
        "updatePromotion",
        400,
        "Invalid points",
        "body:",
        req.body,
        "params:",
        req.params
      );
      return res.status(400).json({ error: "Invalid points" });
    }
    data.points = parseInt(points, 10);
  }

  try {
    const updatedPromotion = await prisma.promotion.update({
      where: {
        id: parseInt(promotionId, 10),
      },
      data,
    });

    return res.status(200).json({
      id: updatedPromotion.id,
      name: updatedPromotion.name,
      type: updatedPromotion.type,
      ...(name && { name: updatedPromotion.name }),
      ...(description && { description: updatedPromotion.description }),
      ...(type && { type: updatedPromotion.type }),
      ...(startTime && { startTime: updatedPromotion.startTime }),
      ...(endTime && { endTime: updatedPromotion.endTime }),
      ...(minSpending !== undefined && {
        minSpending: updatedPromotion.minSpending,
      }),
      ...(rate !== undefined && { rate: updatedPromotion.rate }),
      ...(points !== undefined && { points: updatedPromotion.points }),
    });
  } catch (error) {
    console.log("🚀 ~ updatePromotion ~ error:", error);
    console.log("Request body:", req.body);
    return res.status(500).json({ error: error.message });
  }
};

const deletePromotion = async (req, res) => {
  console.log("deletePromotion called");
  const { promotionId } = req.params;

  const promotion = await prisma.promotion.findUnique({
    where: {
      id: parseInt(promotionId, 10),
    },
  });

  if (!promotion) {
    console.log("deletePromotion", 404, "Promotion not found", req.params);
    return res.status(404).json({ error: "Promotion not found" });
  }

  if (promotion.startTime < new Date()) {
    console.log(
      "deletePromotion",
      403,
      "Cannot delete a promotion that has already started",
      req.params
    );
    return res.status(403).json({
      error: "Cannot delete a promotion that has already started or ended",
    });
  }

  try {
    await prisma.promotion.delete({
      where: {
        id: parseInt(promotionId, 10),
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log("🚀 ~ deletePromotion ~ error:", error);
    console.log("Request params:", req.params);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};
