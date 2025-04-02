const prisma = require("../prisma/prisma_client");

const clearance = (roles) => async (req, res, next) => {
  if (roles.includes("EventOrganizer") && !roles.includes(req.user.role)) {
    const { eventId } = req.params;
    const eventIdInt = parseInt(eventId, 10);
    const userIdInt = parseInt(req.user.id, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).send({ error: "Invalid user id" });
    }
    if (isNaN(eventIdInt)) {
      return res.status(400).send({ error: "Invalid event id" });
    }
    const eventOrganizer = await prisma.eventOrganizer.findUnique({
      where: {
        eventId_organizerId: {
          eventId: eventIdInt,
          organizerId: userIdInt,
        },
      },
    });

    if (!eventOrganizer) {
      console.log(
        req.method,
        ":",
        req.originalUrl,
        "- allowed roles",
        roles,
        " - user",
        req.user
      );
      return res
        .status(403)
        .send({ error: "You do not have permission to access this resource" });
    }
    req.user.role = "EventOrganizer";
    return next();
  }

  if (roles.includes(req.user.role)) {
    next();
  } else {
    console.log(
      req.method,
      ":",
      req.originalUrl,
      "- allowed roles",
      roles,
      " - user role",
      req.user.role
    );
    return res
      .status(403)
      .send({ error: "You do not have permission to access this resource" });
  }
};

module.exports = clearance;
