const { TransactionType, TokenType, Role } = require("@prisma/client");
const uuid = require("uuid");
const prisma = require("../prisma/prisma_client");
const {
  comparePassword,
  hashedPassword,
  passwordRegex,
} = require("../utils/jwt");

const createUser = async (req, res) => {
  const { utorid, name, email } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;

  if (
    !utorid ||
    !name ||
    !email ||
    utorid.length !== 8 ||
    !emailRegex.test(email) ||
    name.length < 1 ||
    name.length > 50
  ) {
    return res.status(400).send({ error: "Invalid input" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        utorid,
        name,
        email,
      },
    });
    const expiry7days = new Date();
    expiry7days.setDate(expiry7days.getDate() + 7);
    expiry7days.setMilliseconds(0);
    const resetToken = await prisma.token.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        token: uuid.v4(),
        type: TokenType.RESET_TOKEN,
        expiresAt: expiry7days, // expires in 7 days
      },
    });
    return res.status(201).json({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      verified: user.verified,
      resetToken: resetToken.token,
      expiresAt: resetToken.expiresAt,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "User already exists" });
    }
    return res.sendStatus(500);
  }
};

const getUsers = async (req, res) => {
  const { name, role, verified, activated, page = 1, limit = 10 } = req.query;

  if (verified && verified !== "true" && verified !== "false") {
    return res.status(400).send("Invalid verified value");
  }
  if (activated && activated !== "true" && activated !== "false") {
    return res.status(400).send("Invalid activated value");
  }

  let filters = {};
  if (name) filters.name = { contains: name };
  if (role) filters.role = { equals: role };
  if (verified) filters.verified = verified === "true";
  if (activated) filters.activated = activated === "true";

  const pageNumeric = parseInt(page, 10);
  const limitNumeric = parseInt(limit, 10);
  if (
    isNaN(pageNumeric) ||
    isNaN(limitNumeric) ||
    pageNumeric <= 0 ||
    limitNumeric <= 0
  ) {
    return res.status(400).send("Invalid input");
  }

  try {
    const totalUsers = await prisma.user.count({
      where: filters,
    });

    const users = await prisma.user.findMany({
      where: filters,
      skip: (pageNumeric - 1) * limitNumeric,
      take: limitNumeric,
    });

    return res.status(200).json({
      count: totalUsers,
      results: users.map((user) => ({
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        role: user.role,
        points: user.points,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        verified: user.verified,
        avatarUrl: user.avatarUrl,
      })),
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const isManagerOrSuperuser =
    req.user.role === "manager" || req.user.role === "superuser";
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        UserPromotion: {
          include: {
            promotion: true,
          },
          where: {
            promotion: {
              type: "ONETIME",
            },
            redeemed: false,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).json({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      points: user.points,
      verified: user.verified,
      promotions: user.UserPromotion.map((up) => ({
        id: up.promotion.id,
        name: up.promotion.name,
        minSpending: up.promotion.minSpending,
        rate: up.promotion.rate,
        points: up.promotion.points,
      })),
      ...(isManagerOrSuperuser && {
        email: user.email,
        birthday: user.birthday,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        avatarUrl: user.avatar,
      }),
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        UserPromotion: {
          include: {
            promotion: true,
          },
          where: {
            promotion: {
              type: "ONETIME",
            },
            redeemed: false,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).json({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      verified: user.verified,
      avatarUrl: user.avatarUrl,
      promotions: user.UserPromotion.map((up) => ({
        id: up.promotion.id,
        name: up.promotion.name,
        minSpending: up.promotion.minSpending,
        rate: up.promotion.rate,
        points: up.promotion.points,
      })),
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const updateCurrentUser = async (req, res) => {
  const { email, name, birthday } = req.body;

  if (!email && !name && !birthday && !req.file) {
    return res.status(400).send({ error: "Empty payload" });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const date = new Date(birthday);
  if (
    birthday &&
    (isNaN(date.getTime()) ||
      !dateRegex.test(birthday) ||
      date.toISOString().slice(0, 10) !== birthday)
  ) {
    return res.status(400).send({ error: "Invalid birthday format" });
  }
  if (email && !emailRegex.test(email)) {
    return res.status(400).send({ error: "Invalid email format" });
  }
  if (name && (name.length < 1 || name.length > 50)) {
    return res.status(400).send({ error: "Invalid name length" });
  }

  const update = {};
  if (email) update.email = email;
  if (name) update.name = name;
  if (birthday) update.birthday = birthday;
  if (req.file) update.avatarUrl = req.file.path;

  try {
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: update,
    });

    return res.status(200).json({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      verified: user.verified,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const updateUserById = async (req, res) => {
  const { userId } = req.params;
  const { email, verified, suspicious, role } = req.body;

  if (
    !email &&
    (verified === undefined || verified === null) &&
    (suspicious === undefined || suspicious === null) &&
    !role
  ) {
    return res
      .status(400)
      .send({ error: "At least one field must be provided to update" });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@mail\.utoronto\.ca$/;

  if (email && !emailRegex.test(email)) {
    return res.status(400).send({ error: "Invalid email format" });
  }

  if (
    verified !== undefined &&
    verified !== null &&
    typeof verified !== "boolean"
  ) {
    return res.status(400).send({ error: "Invalid verified value" });
  }

  if (verified === false) {
    return res.status(400).send({ error: "You cannot set verified to false" });
  }

  if (
    suspicious !== undefined &&
    suspicious !== null &&
    typeof suspicious !== "boolean"
  ) {
    return res.status(400).send({ error: "Invalid suspicious value" });
  }

  if (role && !Object.values(Role).includes(role)) {
    return res.status(400).send({ error: "Invalid role value" });
  }

  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    return res.status(400).send({ error: "Invalid userId" });
  }

  const update = {};
  const select = {};
  if (email) {
    update.email = email;
    select.email = true;
  }

  if (verified !== undefined && verified !== null) {
    update.verified = verified;
    select.verified = true;
  }
  if (suspicious !== undefined && suspicious !== null) {
    update.suspicious = suspicious;
    select.suspicious = true;
  }

  if (role) {
    if (
      req.user.role === Role.manager &&
      (role === Role.superuser || role === Role.manager)
    ) {
      return res.status(403).send({
        error: `You do not have permission to change the role to ${role}`,
      });
    }

    update.role = role;
    select.role = true;
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: userIdInt,
      },
      data: update,
      select: {
        id: true,
        utorid: true,
        name: true,
        ...select,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.sendStatus(500);
  }
};

const updateMyPassword = async (req, res) => {
  const { old, new: newPassword } = req.body;
  if (!old || !newPassword) {
    return res.status(400).send({ error: "Invalid input" });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).send({ error: "Invalid password format" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (!comparePassword(old, user.password)) {
      return res.status(403).send({ error: "Invalid existing password" });
    }

    const hashedPasswordValue = await hashedPassword(newPassword);

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        password: hashedPasswordValue,
      },
    });

    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};

const createTransfer = async (req, res) => {
  const { type, amount, remark } = req.body;
  const { userId } = req.params;
  const recipientId = parseInt(userId, 10);
  const points = parseInt(amount, 10);
  if (type !== TransactionType.transfer) {
    return res.status(400).send({ error: "Invalid transaction type" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (user.points < points) {
      return res.status(400).send({ error: "Insufficient balance" });
    }

    const recipient = await prisma.user.findUnique({
      where: {
        id: recipientId,
      },
    });

    if (!recipient) {
      return res.status(404).send({ error: "Recipient not found" });
    }

    const SenderTransaction = await prisma.transaction.create({
      data: {
        type,
        points: -points,
        remark,
        relatedId: recipientId,
        userId: req.user.id,
        createdBy: req.user.id,
      },
    });

    const RecipientTransaction = await prisma.transaction.create({
      data: {
        type,
        points,
        remark,
        relatedId: req.user.id,
        userId: recipientId,
        createdBy: req.user.id,
      },
    });

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        points: {
          decrement: points,
        },
      },
    });

    await prisma.user.update({
      where: {
        id: recipientId,
      },
      data: {
        points: {
          increment: points,
        },
      },
    });

    res.status(201).send({
      id: SenderTransaction.id,
      sender: user.utorid,
      recipient: recipient.utorid,
      type,
      sent: points,
      remark: SenderTransaction.remark ?? "",
      createdBy: user.utorid,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const createRedemption = async (req, res) => {
  const { type, amount, remark } = req.body;
  const points = parseInt(amount, 10);
  if (type !== TransactionType.redemption) {
    return res.status(400).send({ error: "Invalid transaction type" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (user.points < points) {
      return res.status(400).send({ error: "Insufficient balance" });
    }

    const redemption = await prisma.transaction.create({
      data: {
        type,
        points: points,
        remark,
        userId: req.user.id,
        createdBy: req.user.id,
      },
    });

    return res.status(201).send({
      id: redemption.id,
      utorid: user.utorid,
      type,
      amount: points,
      remark: redemption.remark ?? "",
      createdBy: user.utorid,
      processedBy: null,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

const getTransactions = async (req, res) => {
  const {
    type,
    relatedId,
    promotionId,
    amount,
    operator,
    page = 1,
    limit = 10,
  } = req.query;

  if (!type && relatedId) {
    
    return res
      .status(400)
      .json({ error: "type and relatedId must be used together" });
  }

  if ((amount && !operator) || (!amount && operator)) {
    return res
      .status(400)
      .json({ error: "amount and operator must be used together" });
  }

  let where = {
    userId: req.user.id,
  };

  if (promotionId) where.promotionIds = { contains: parseInt(promotionId, 10) };
  if (type) where.type = type;
  if (relatedId) where.relatedId = parseInt(relatedId, 10);
  if (amount && operator) where.points = { [operator]: parseInt(amount, 10) };

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      ...(limit && { take: parseInt(limit, 10) }),
      ...(page &&
        limit && { skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) }),
      include: {
        Promotions: true,
        createdByUser: true,
      },
    });

    res.status(200).send({
      count: transactions.length,
      results: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        relatedId: transaction.relatedId,
        spent: transaction.spent,
        amount: transaction.points,
        promotionIds: transaction.Promotions.map((promotion) => promotion.id),
        remark: transaction.remark ?? "",
        createdBy: transaction.createdByUser.utorid,
      })),
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  updateUserById,
  updateMyPassword,
  createTransfer,
  createRedemption,
  getTransactions,
};
