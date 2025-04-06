const prisma = require("../prisma/prisma_client");
const { TransactionType } = require("@prisma/client");

const calculatePoints = async (spent, rateList) => {
  let points = 0;
  rateList.forEach(async (rate) => {
    points += Math.round(parseFloat(spent) * rate * 100);
  });
  points += Math.round(parseFloat(spent) * 4); // regular 4 points per dollar
  return points;
};

const createTransaction = async (req, res) => {
  const { utorid, type, spent, promotionIds, remark } = req.body;
  const data = {
    type,
    spent,
  };

  if (!spent || isNaN(spent) || parseFloat(spent) <= 0) {
    return res
      .status(400)
      .json({ error: "Spent amount must be a positive number" });
  }

  if (promotionIds && !promotionIds.every(Number.isInteger)) {
    return res
      .status(400)
      .json({ error: "All promotion IDs must be integers" });
  }

  const rateList = [];
  let lumpSumPoints = 0;

  for (const promotionId of promotionIds) {
    const promotion = await prisma.promotion.findUnique({
      where: {
        id: promotionId,
      },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    if (promotion.type === "one-time") {
      const transactionPromotion = await prisma.transactionPromotion.findFirst({
        where: {
          promotionId,
          transaction: {
            user: {
              utorid,
            },
          },
        },
      });
      if (transactionPromotion) {
        return res
          .status(400)
          .json({ error: `Promotion ${promotionId} is one-time only` });
      }
    }
    if (spent < promotion.minSpending) {
      return res.status(400).json({
        error: `Minimum spend of ${promotion.minSpending} not met for promotion ${promotionId}`,
      });
    }
    if (promotion.points) {
      lumpSumPoints += promotion.points
    }
    rateList.push(promotion.rate);
  }

  const totalPoints = await calculatePoints(
    spent,
    rateList,
  );
  data.points = totalPoints + lumpSumPoints;

  if (remark) data.remark = remark;

  try {
    const cashier = await prisma.user.findUnique({
      where: {
        utorid: req.user.utorid,
      },
    });

    if (cashier.suspicious === true) {
      data.suspicious = true;
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        user: {
          connect: {
            utorid,
          },
        },
        createdByUser: {
          connect: {
            utorid: cashier.utorid,
          },
        },
      },
      include: {
        user: true,
        Promotions: true,
      },
    });

    let promotions = [];
    // add transaction-promotion records
    if (promotionIds) {
      const transactionPromotionRecs =
        await prisma.transactionPromotion.createManyAndReturn({
          data: promotionIds.map((promotionId) => ({
            transactionId: transaction.id,
            promotionId: promotionId,
          })),
        });

      promotions.push(
        ...transactionPromotionRecs.map((each) => each.promotionId)
      );
    }

    if (transaction.suspicious !== true) {
      const userpoints = await prisma.user.update({
        where: {
          utorid,
        },
        data: {
          points: {
            increment: data.points,
          },
        },
      });
      console.log('user total points ', userpoints.points, 'after this transaction added', data.points);
    }

    res.status(201).json({
      id: transaction.id,
      utorid: transaction.user.utorid,
      type: transaction.type,
      spent: transaction.spent,
      earned: transaction.suspicious ? 0 : transaction.points,
      promotionIds: promotions,
      remark: transaction.remark ?? "",
      createdBy: req.user.utorid,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

// assumption: adjustment amount could be negative
const adjustTransaction = async (req, res) => {
  const { utorid, type, amount, relatedId, promotionIds, remark } = req.body;

  if (!utorid || !type || !amount || !relatedId) {
    return res
      .status(400)
      .json({ error: "utorid, type, amount, and relatedId are required" });
  }

  if (!Number.isInteger(amount)) {
    return res.status(400).json({ error: "Amount must be an integer" });
  }

  if (!Number.isInteger(relatedId)) {
    return res.status(400).json({ error: "Related ID must be an integer" });
  }

  const data = {
    type,
    relatedId,
  };

  const relatedTransaction = await prisma.transaction.findUnique({
    where: {
      id: relatedId,
    },
  });

  if (!relatedTransaction) {
    return res.status(404).json({ error: "Related transaction not found" });
  }

  data.points = amount;

  if (remark) data.remark = remark;

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        user: {
          connect: {
            utorid,
          },
        },
        createdByUser: {
          connect: {
            utorid: req.user.utorid,
          },
        },
      },
      include: {
        user: true,
        Promotions: true,
      },
    });

    let promotions = [];
    // add transaction-promotion records
    if (promotionIds) {
      const transactionPromotionRecs =
        await prisma.transactionPromotion.createManyAndReturn({
          data: promotionIds.map((promotionId) => ({
            transactionId: transaction.id,
            promotionId: promotionId,
          })),
        });
      promotions.push(
        ...transactionPromotionRecs.map((each) => each.promotionId)
      );
    }

    await prisma.user.update({
      where: {
        utorid,
      },
      data: {
        points: {
          increment: data.points,
        },
      },
    });

    res.status(201).json({
      id: transaction.id,
      utorid: transaction.user.utorid,
      amount: transaction.points,
      type: transaction.type,
      relatedId: transaction.relatedId,
      promotionIds: promotions,
      remark: transaction.remark ?? "",
      createdBy: req.user.utorid,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

const getTransactions = async (req, res) => {
  const {
    name,
    createdBy,
    suspicious,
    promotionId,
    type,
    relatedId,
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

  let where = {};
  if (name)
    where.OR = [
      { user: { name: { equals: name } } },
      { user: { utorid: { equals: name } } },
    ];
  if (createdBy) where.createdByUser = { utorid: { equals: createdBy } };
  if (suspicious === "true" || suspicious === "false") {
    where.suspicious = suspicious === "true";
  }
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
      select: {
        id: true,
        user: {
          select: {
            utorid: true,
          },
        },
        type: true,
        points: true,
        spent: true,
        processedByUser: {
          select: {
            utorid: true,
          },
        },
        Promotions: {
          select: {
            id: true,
            promotionId: true,
          },
        },
        suspicious: true,
        remark: true,
        createdByUser: {
          select: {
            utorid: true,
          },
        },
      },
    });

    const totalTrans = await prisma.transaction.count({where: where});

    res.status(200).json({
      count: totalTrans,
      results: transactions.map((transaction) => ({
        id: transaction.id,
        utorid: transaction.user.utorid,
        amount: transaction.points,
        type: transaction.type,
        spent: transaction.spent,
        promotionIds: transaction.Promotions.map((promotion) => promotion.promotionId),
        suspicious: transaction.suspicious,
        remark: transaction.remark ?? "",
        createdBy: transaction.createdByUser?.utorid,
        processedBy: transaction.processedByUser?.utorid,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

const getTransactionById = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(transactionId, 10),
      },
      select: {
        id: true,
        user: {
          select: {
            utorid: true,
          },
        },
        type: true,
        points: true,
        spent: true,
        Promotions: {
          select: {
            id: true,
          },
        },
        relatedId: true,
        suspicious: true,
        remark: true,
        createdByUser: {
          select: {
            utorid: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json({
      id: transaction.id,
      utorid: transaction.user.utorid,
      amount: transaction.points,
      type: transaction.type,
      spent: transaction.spent,
      promotionIds: transaction.Promotions.map((promotion) => promotion.id),
      suspicious: transaction.suspicious,
      remark: transaction.remark ?? "",
      relatedId: transaction.relatedId,
      createdBy: transaction.createdByUser.utorid,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

const setTransactionSuspicious = async (req, res) => {
  const { transactionId } = req.params;
  const { suspicious } = req.body;

  if (typeof suspicious !== "boolean") {
    return res.status(400).json({ error: "Invalid value for suspicious" });
  }

  try {
    const findTransaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(transactionId, 10),
      },
      select: {
        suspicious: true,
      },
    });

    if (!findTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (findTransaction.suspicious === suspicious) {
      return res.status(200).json({ message: "No changes made" });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: parseInt(transactionId, 10),
      },
      data: {
        suspicious: suspicious,
      },
      select: {
        id: true,
        user: {
          select: {
            utorid: true,
          },
        },
        type: true,
        points: true,
        spent: true,
        Promotions: {
          select: {
            id: true,
          },
        },
        suspicious: true,
        remark: true,
        createdByUser: {
          select: {
            utorid: true,
          },
        },
      },
    });

    if (suspicious === true) {
      await prisma.user.update({
        where: {
          utorid: transaction.user.utorid,
        },
        data: {
          points: {
            decrement: transaction.points,
          },
        },
      });
    } else {
      await prisma.user.update({
        where: {
          utorid: transaction.user.utorid,
        },
        data: {
          points: {
            increment: transaction.points,
          },
        },
      });
    }

    res.status(200).json({
      id: transaction.id,
      utorid: transaction.user.utorid,
      amount: transaction.points,
      type: transaction.type,
      spent: transaction.spent,
      promotionIds: transaction.Promotions.map((promotion) => promotion.id),
      suspicious: transaction.suspicious,
      remark: transaction.remark ?? "",
      createdBy: transaction.createdByUser.utorid,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

const processTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const { processed } = req.body;

  if (processed !== true) {
    return res.status(400).json({ error: "Invalid value for processed" });
  }

  try {
    const findTransaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(transactionId, 10),
      },
    });

    if (!findTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (findTransaction.type !== TransactionType.redemption) {
      return res
        .status(400)
        .json({ message: "Only redemption transactions can be processed" });
    }

    if (findTransaction.processedBy) {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id: parseInt(transactionId, 10),
      },
      data: {
        processedByUser: {
          connect: {
            id: req.user.id,
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            utorid: true,
          },
        },
        type: true,
        points: true,
        spent: true,
        Promotions: {
          select: {
            id: true,
          },
        },
        remark: true,
        processedByUser: {
          select: {
            utorid: true,
          },
        },
        createdByUser: {
          select: {
            utorid: true,
          },
        },
      },
    });

    await prisma.user.update({
      where: {
        utorid: transaction.user.utorid,
      },
      data: {
        points: {
          decrement: transaction.points,
        },
      },
    });

    res.status(200).json({
      id: transaction.id,
      utorid: transaction.user.utorid,
      type: transaction.type,
      redeemed: transaction.points,
      processedBy: transaction.processedByUser.utorid,
      remark: transaction.remark ?? "",
      createdBy: transaction.createdByUser.utorid,
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

module.exports = {
  createTransaction,
  adjustTransaction,
  getTransactions,
  getTransactionById,
  setTransactionSuspicious,
  processTransaction,
};
