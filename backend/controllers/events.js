const { TransactionType, Role } = require("@prisma/client");

const prisma = require("../prisma/prisma_client");

const createEvent = async (req, res) => {
  const { name, description, location, startTime, endTime, capacity, points } =
    req.body;

  if (!name || !description || !location || !startTime || !endTime || !points) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (capacity && (!Number.isInteger(capacity) || capacity <= 0)) {
    return res
      .status(400)
      .json({ error: "Capacity must be a positive integer or null." });
  }

  if (points && (!Number.isInteger(points) || points < 0)) {
    return res
      .status(400)
      .json({ error: "Points must be a non-negative integer." });
  }

  // Validate startTime and endTime
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use ISO 8601 format." });
  }

  if (end <= start) {
    return res.status(400).json({ error: "endTime must be after startTime." });
  }

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        location,
        startTime: start,
        endTime: end,
        capacity: capacity || null,
        pointsRemain: points,
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    res.status(201).json({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      capacity: event.capacity,
      published: event.published,
      pointsRemain: event.pointsRemain,
      pointsAwarded: event.pointsAwarded,
      organizers: event.EventGuests.map((guest) => guest.guest.utorid),
      guests: event.EventOrganizer.map(
        (organizer) => organizer.organizer.utorid
      ),
    });
  } catch (error) {
    console.log("🚀 ~ createEvent ~ error:", error);
    console.log("Request body:", req.body);
    res.status(400).json({ error: error.message });
  }
};

const getEvents = async (req, res) => {
  console.log("getEvents called, query:", req.query);
  try {
    const {
      name,
      location,
      started,
      ended,
      showFull = false,
      published,
      page = 1,
      limit = 10,
    } = req.query;

    const isManagerOrSuperuser = [Role.manager, Role.superuser].includes(
      req.user.role
    );

    const validBooleanValues = ["true", "false"];

    if (started && !validBooleanValues.includes(started)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for started. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for started. Use 'true' or 'false'." });
    }

    if (ended && !validBooleanValues.includes(ended)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for ended. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res

        .status(400)
        .json({ error: "Invalid value for ended. Use 'true' or 'false'." });
    }

    if (showFull && !validBooleanValues.includes(showFull)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for showFull. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for showFull. Use 'true' or 'false'." });
    }

    if (published && !validBooleanValues.includes(published)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for published. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for published. Use 'true' or 'false'." });
    }

    if (published && ![Role.manager, Role.superuser].includes(req.user.role)) {
      console.log(
        "getEvents",
        403,
        "Unauthorized. Only managers and superusers can view unpublished events.",
        "Request query:",
        req.query
      );
      return res.status(403).json({
        error:
          "Unauthorized. Only managers and superusers can view unpublished events.",
      });
    }

    if (started && ended) {
      console.log(
        "getEvents",
        400,
        "Cannot have both started and ended together.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Cannot have both started and ended together." });
    }

    let where = {};
    if (name) {
      where.name = {
        contains: name,
      };
    }
    if (location) {
      where.location = {
        contains: location,
      };
    }

    const now = new Date();
    if (started === "true") {
      where.startTime = {
        lte: now,
      };
    } else if (started === "false") {
      where.startTime = {
        gt: now,
      };
    }

    if (ended === "true") {
      where.endTime = {
        lte: now,
      };
    } else if (ended === "false") {
      where.endTime = {
        gt: now,
      };
    }

    if (published) {
      where.published = published === "true";
    }

    if (!isManagerOrSuperuser) {
      where.published = true;
    }

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt <= 0 || limitInt <= 0) {
      console.log(
        "getEvents",
        400,
        "Invalid page or limit.",
        "Request query:",
        req.query
      );
      return res.status(400).json({ error: "Invalid page or limit." });
    }

    const totalEvents = await prisma.event.findMany({
      where,
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    const totalPublishedEvents = await prisma.event.findMany({
      where: {
        ...where,
        published: true,
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });
    console.log("🚀 ~ getEvents ~ where:", where);
    console.log("🚀 ~ getEvents ~ totalEvents: count", totalEvents.length);
    console.log("🚀 ~ getEvents ~ totalEvents:", totalEvents);

    const eventCount = totalEvents.filter((event) => {
      if (showFull && showFull === "false") {
        return (
          event.capacity === null || event.capacity > event.EventGuests.length
        );
      }
      return true;
    }).length;

    const publishedEventCount = totalPublishedEvents.filter((event) => {
      if (showFull && showFull === "false") {
        return (
          event.capacity === null || event.capacity > event.EventGuests.length
        );
      }
      return true;
    }).length;
    console.log("🚀 ~ getEvents ~ eventCount:", eventCount);

    const events = await prisma.event.findMany({
      where,
      skip: (pageInt - 1) * limitInt,
      take: limitInt,
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    return res.status(200).json({
      count: eventCount,
      publishedCount: publishedEventCount,
      results: events
        .filter((event) => {
          if (showFull && showFull === "false") {
            return (
              event.capacity === null ||
              event.capacity > event.EventGuests.length
            );
          }
          return true;
        })
        .map((event) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          capacity: event.capacity || null,
          numGuests: event.EventGuests.length,
          ...(isManagerOrSuperuser && {
            published: event.published,
            pointsAwarded: event.pointsAwarded,
            pointsRemain: event.pointsRemain,
          }),
        })),
    });
  } catch (error) {
    console.log("🚀 ~ getEvents ~ error:", error);
    console.log("Request query:", req.query);
    res.status(500).json({ error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  console.log("getEvents called, query:", req.query);
  try {
    const {
      name,
      location,
      started,
      ended,
      showFull = false,
      published,
      page = 1,
      limit = 10,
    } = req.query;

    const isOrganizerOrManagerOrSuperuser = [
      "EventOrganizer",
      Role.manager,
      Role.superuser,
    ].includes(req.user.role);

    const validBooleanValues = ["true", "false"];

    if (started && !validBooleanValues.includes(started)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for started. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for started. Use 'true' or 'false'." });
    }

    if (ended && !validBooleanValues.includes(ended)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for ended. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res

        .status(400)
        .json({ error: "Invalid value for ended. Use 'true' or 'false'." });
    }

    if (showFull && !validBooleanValues.includes(showFull)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for showFull. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for showFull. Use 'true' or 'false'." });
    }

    if (published && !validBooleanValues.includes(published)) {
      console.log(
        "getEvents",
        400,
        "Invalid value for published. Use 'true' or 'false'.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Invalid value for published. Use 'true' or 'false'." });
    }

    if (
      published &&
      !["EventOrganizer", Role.manager, Role.superuser].includes(req.user.role)
    ) {
      console.log(
        "getEvents",
        403,
        "Unauthorized. Only managers and superusers can view unpublished events.",
        "Request query:",
        req.query
      );
      return res.status(403).json({
        error:
          "Unauthorized. Only managers and superusers can view unpublished events.",
      });
    }

    if (started && ended) {
      console.log(
        "getEvents",
        400,
        "Cannot have both started and ended together.",
        "Request query:",
        req.query
      );
      return res
        .status(400)
        .json({ error: "Cannot have both started and ended together." });
    }

    let where = {};
    if (name) {
      where.name = {
        contains: name,
      };
    }
    if (location) {
      where.location = {
        contains: location,
      };
    }

    const now = new Date();
    if (started === "true") {
      where.startTime = {
        lte: now,
      };
    } else if (started === "false") {
      where.startTime = {
        gt: now,
      };
    }

    if (ended === "true") {
      where.endTime = {
        lte: now,
      };
    } else if (ended === "false") {
      where.endTime = {
        gt: now,
      };
    }

    if (published) {
      where.published = published === "true";
    }

    if (!isOrganizerOrManagerOrSuperuser) {
      where.published = true;
    }

    where.EventOrganizer = {
      some: {
        organizerId: req.user.id,
      },
    };

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt <= 0 || limitInt <= 0) {
      console.log(
        "getEvents",
        400,
        "Invalid page or limit.",
        "Request query:",
        req.query
      );
      return res.status(400).json({ error: "Invalid page or limit." });
    }

    const totalEvents = await prisma.event.findMany({
      where,
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    const eventCount = totalEvents.filter((event) => {
      if (showFull && showFull === "false") {
        return (
          event.capacity === null || event.capacity > event.EventGuests.length
        );
      }
      return true;
    }).length;
    console.log("🚀 ~ getEvents ~ eventCount:", eventCount);

    const events = await prisma.event.findMany({
      where,
      skip: (pageInt - 1) * limitInt,
      take: limitInt,
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    return res.status(200).json({
      count: eventCount,
      results: events
        .filter((event) => {
          if (showFull && showFull === "false") {
            return (
              event.capacity === null ||
              event.capacity > event.EventGuests.length
            );
          }
          return true;
        })
        .map((event) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          capacity: event.capacity || null,
          numGuests: event.EventGuests.length,
          ...(isOrganizerOrManagerOrSuperuser && {
            published: event.published,
            pointsAwarded: event.pointsAwarded,
            pointsRemain: event.pointsRemain,
          }),
        })),
    });
  } catch (error) {
    console.log("🚀 ~ getEvents ~ error:", error);
    console.log("Request query:", req.query);
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  console.log("getEventById called");
  const { eventId } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!event) {
      console.log(
        "getEventById",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    const isOrganizer = [
      Role.manager,
      Role.superuser,
      "EventOrganizer",
    ].includes(req.user.role);

    if (!event.published && !isOrganizer) {
      console.log(
        "getEventById",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    // const isOrganizer = event.EventOrganizer.some(
    //   (organizer) => organizer.organizer.id === req.user.id
    // );

    // if (
    //   event.published === false &&
    //   [Role.cashier, Role.regular].includes(req.user.role) &&
    //   !isOrganizer
    // ) {
    //   return res.status(404).json({ error: "Event not found." });
    // }

    // const isManagerOrSuperuser = [Role.manager, Role.superuser].includes(
    //   req.user.role
    // );

    return res.status(200).json({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      capacity: event.capacity,
      numGuests: event.EventGuests.length,
      organizers: event.EventOrganizer.map((organizer) => ({
        id: organizer.organizer.id,
        utorid: organizer.organizer.utorid,
        name: organizer.organizer.name,
      })),
      ...(isOrganizer
        ? {
            pointsAwarded: event.pointsAwarded,
            pointsRemain: event.pointsRemain,
            published: event.published,
            guests: event.EventGuests.map((guest) => ({
              id: guest.guest.id,
              utorid: guest.guest.utorid,
              name: guest.guest.name,
            })),
          }
        : {}),
    });
  } catch (error) {
    console.log("🚀 ~ getEventById ~ error:", error);
    console.log("Request params:", req.params);
    res.status(500).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const {
    name,
    description,
    location,
    startTime,
    endTime,
    capacity = null,
    points,
    published,
  } = req.body;

  const { eventId } = req.params;

  const isManagerOrSuperUser =
    req.user.role === Role.manager || req.user.role === Role.superuser;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const isStarted = new Date(event.startTime) < new Date();
    const isEnded = new Date(event.endTime) < new Date();

    if (isStarted) {
      if (name || description || location || startTime || capacity) {
        return res.status(400).json({
          error:
            "Cannot update name, description, location, startTime, or capacity after the event has started.",
        });
      }
    }

    if (isEnded && endTime) {
      return res.status(400).json({
        error: "Cannot update endTime after the event has ended.",
      });
    }

    const data = {};

    if (name) {
      data.name = name;
    }

    if (description) {
      data.description = description;
    }

    if (location) {
      data.location = location;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      (startTime && isNaN(start.getTime())) ||
      (endTime && isNan(end.getTime()))
    ) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use ISO 8601 format." });
    }

    if (startTime && start < new Date()) {
      return res
        .status(400)
        .json({ error: "startTime cannot be in the past." });
    }

    if (endTime && end < new Date()) {
      return res.status(400).json({ error: "endTime cannot be in the past." });
    }

    if (startTime && endTime && end <= start) {
      return res
        .status(400)
        .json({ error: "endTime must be after startTime." });
    }

    if (startTime) {
      data.startTime = start;
    }
    if (endTime) {
      data.endTime = end;
    }

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || parseInt(capacity, 10) <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "Capacity must be a positive integer or null." });
    }

    if (capacity !== null && capacity < event.EventGuests.length) {
      return res.status(400).json({
        error: "Capacity cannot be less than the number of confirmed guests.",
      });
    }

    if (capacity !== null) {
      data.capacity = parseInt(capacity, 10);
    }

    if (!isManagerOrSuperUser && (points || published)) {
      return res.status(403).json({
        error:
          "Unauthorized. Only managers can update points or published status.",
      });
    }

    if (points && (!Number.isInteger(points) || parseInt(points, 10) < 0)) {
      return res
        .status(400)
        .json({ error: "Points must be a non-negative integer." });
    }

    if (points && event.pointsAwarded > parseInt(points, 10)) {
      return res.status(400).json({
        error: "Points cannot be less than the points already awarded.",
      });
    }

    // input points = 80
    // awarded = 50
    // remain = 30 (new input points - awarded points)

    if (points) {
      data.pointsRemain = parseInt(points, 10) - event.pointsAwarded;
    }

    if (published && typeof published !== "boolean") {
      return res
        .status(400)
        .json({ error: "Published must be a boolean value." });
    }

    if (published) {
      data.published = published;
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: parseInt(eventId, 10),
      },
      data,
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    return res.status(200).json({
      id: updatedEvent.id,
      name: updatedEvent.name,
      location: updatedEvent.location,
      ...(description ? { description: updatedEvent.description } : {}),
      ...(startTime ? { startTime: updatedEvent.startTime } : {}),
      ...(endTime ? { endTime: updatedEvent.endTime } : {}),
      ...(capacity !== null ? { capacity: updatedEvent.capacity } : {}),
      ...(points
        ? {
            points: updatedEvent.pointsRemain + updatedEvent.pointsAwarded,
            pointsRemain: updatedEvent.pointsRemain,
            pointsAwarded: updatedEvent.pointsAwarded,
          }
        : {}),
      ...(published ? { published: updatedEvent.published } : {}),
    });
  } catch (error) {
    console.log("🚀 ~ updateEvent ~ error:", error);
    console.log("Request body:", req.body);
    return res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  console.log("deleteEvent called");
  const { eventId } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!event) {
      console.log(
        "deleteEvent",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    if (event.published === true) {
      console.log(
        "deleteEvent",
        400,
        "Cannot delete a published event.",
        "Request params:",
        req.params
      );
      return res.status(400).json({
        error: "Cannot delete a published event.",
      });
    }

    await prisma.event.delete({
      where: {
        id: parseInt(eventId, 10),
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log("🚀 ~ deleteEvent ~ error:", error);
    console.log("Request params:", req.params);
    return res.status(500).json({ error: error.message });
  }
};

const addEventOrganizer = async (req, res) => {
  const { eventId } = req.params;
  const { utorid } = req.body;

  if (!eventId || isNaN(parseInt(eventId, 10))) {
    return res.status(400).json({ error: "Invalid eventId." });
  }

  if (!utorid || typeof utorid !== "string") {
    return res.status(400).json({ error: "Invalid utorid." });
  }

  try {
    const findEvent = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!findEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (new Date(findEvent.endTime) < new Date()) {
      return res.status(410).json({ error: "Event has already ended." });
    }

    const organizer = await prisma.user.findUnique({
      where: {
        utorid,
      },
      include: {
        EventOrganizer: {
          include: {
            event: true,
          },
        },
        EventGuests: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!organizer) {
      return res.status(404).json({ error: "Organizer not found." });
    }

    if (
      organizer.EventGuests.some(
        (event) => event.eventId === parseInt(eventId, 10)
      )
    ) {
      return res.status(400).json({
        error:
          "Organizer is already a guest. Remove them from guest list and try again",
      });
    }

    if (
      organizer.EventOrganizer.some(
        (event) => event.eventId === parseInt(eventId, 10)
      )
    ) {
      return res.status(400).json({
        error: "Organizer is already an Organizer.",
      });
    }

    await prisma.eventOrganizer.create({
      data: {
        eventId: parseInt(eventId, 10),
        organizerId: organizer.id,
      },
    });

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventOrganizer: {
          include: {
            organizer: true,
          },
        },
      },
    });

    return res.status(201).json({
      id: event.id,
      name: event.name,
      location: event.location,
      organizers: event.EventOrganizer.map((organizer) => ({
        id: organizer.organizer.id,
        utorid: organizer.organizer.utorid,
        name: organizer.organizer.name,
      })),
    });
  } catch (error) {
    console.log("🚀 ~ addEventOrganizer ~ error:", error);
    console.log("Request body:", req.body);
    return res.status(500).json({ error: error.message });
  }
};

const removeEventOrganizer = async (req, res) => {
  console.log("removeEventOrganizer called");
  const { eventId, userId } = req.params;

  try {
    await prisma.eventOrganizer.delete({
      where: {
        eventId_organizerId: {
          eventId: parseInt(eventId, 10),
          organizerId: parseInt(userId, 10),
        },
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    console.log("🚀 ~ removeEventOrganizer ~ error:", error);
    console.log("Request params:", req.params);
    return res.status(500).json({ error: error.meta.cause });
  }
};

const addEventGuest = async (req, res) => {
  console.log("addEventGuest called", "params:", req.params, "body:", req.body);
  const { utorid } = req.body;
  const { eventId } = req.params;

  if (!eventId || isNaN(parseInt(eventId, 10))) {
    console.log(
      "addEventGuest",
      400,
      "Invalid eventId.",
      "Request params:",
      req.params
    );
    return res.status(400).json({ error: "Invalid eventId." });
  }

  if (!utorid || typeof utorid !== "string") {
    console.log(
      "addEventGuest",
      400,
      "Invalid utorid.",
      "Request body:",
      req.body
    );
    return res.status(400).json({ error: "Invalid utorid." });
  }

  try {
    const findEvent = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    if (!findEvent) {
      console.log(
        "addEventGuest",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    if (new Date(findEvent.endTime) < new Date()) {
      console.log(
        "addEventGuest",
        410,
        "Event has already ended.",
        "Request params:",
        req.params
      );
      return res.status(410).json({ error: "Event has already ended." });
    }

    if (
      findEvent.capacity !== null &&
      findEvent.EventGuests.length === findEvent.capacity
    ) {
      return res.status(410).json({ error: "Event is full." });
    }

    const guest = await prisma.user.findUnique({
      where: {
        utorid,
      },
      include: {
        EventOrganizer: {
          include: {
            event: true,
          },
        },
        EventGuests: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!guest) {
      console.log(
        "addEventGuest",
        404,
        "Guest not found.",
        "Request body:",
        req.body
      );
      return res.status(404).json({ error: "Guest not found." });
    }

    if (
      guest.EventOrganizer.some(
        (event) => event.eventId === parseInt(eventId, 10)
      )
    ) {
      console.log(
        "addEventGuest",
        400,
        "Guest is already an Organizer. Remove them from organizer list and try again.",
        "Request body:",
        req.body
      );
      return res.status(400).json({
        error:
          "Guest is already an Organizer. Remove them from organizer list and try again",
      });
    }

    //  404 Not Found if the event is not visible to the organizer yet
    //  question why organizer cannot see unpublished events?

    await prisma.eventGuests.create({
      data: {
        eventId: parseInt(eventId, 10),
        guestId: guest.id,
      },
    });

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    return res.status(201).json({
      id: event.id,
      name: event.name,
      location: event.location,
      numGuests: event.EventGuests.length,
      guestAdded: {
        id: guest.id,
        utorid: guest.utorid,
        name: guest.name,
      },
    });
  } catch (error) {
    console.log("🚀 ~ addEventGuest ~ error:", error);
    console.log("Request body:", req.body);
    return res.status(500).json({ error: error.message });
  }
};

const removeEventGuest = async (req, res) => {
  console.log("removeEventGuest called");
  const { eventId, userId } = req.params;

  try {
    await prisma.eventGuests.delete({
      where: {
        eventId_guestId: {
          eventId: parseInt(eventId, 10),
          guestId: parseInt(userId, 10),
        },
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    console.log("🚀 ~ removeEventGuest ~ error:", error);
    console.log("Request params:", req.params);
    return res.status(500).json({ error: error.meta.cause });
  }
};

const addMeToEventGuest = async (req, res) => {
  console.log("addMeToEventGuest called");
  const { eventId } = req.params;

  try {
    const findEvent = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
        published: true,
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    if (!findEvent) {
      console.log(
        "addMeToEventGuest",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    if (new Date(findEvent.endTime) < new Date()) {
      console.log(
        "addMeToEventGuest",
        410,
        "Event has already ended.",
        "Request params:",
        req.params
      );
      return res.status(410).json({ error: "Event has already ended." });
    }

    if (findEvent.EventGuests.some((guest) => guest.guestId === req.user.id)) {
      console.log(
        "addMeToEventGuest",
        400,
        "You are already a guest.",
        "Request params:",
        req.params
      );
      return res.status(400).json({ error: "You are already a guest." });
    }

    if (
      findEvent.capacity !== null &&
      findEvent.EventGuests.length >= findEvent.capacity
    ) {
      console.log(
        "addMeToEventGuest",
        400,
        "Event is full.",
        "Request params:",
        req.params
      );
      return res.status(400).json({ error: "Event is full." });
    }

    const guest = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        EventOrganizer: {
          include: {
            event: true,
          },
        },
        EventGuests: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!guest) {
      console.log(
        "addMeToEventGuest",
        404,
        "Guest not found.",
        "Request user:",
        req.user
      );
      return res.status(404).json({ error: "Guest not found." });
    }

    if (
      guest.EventOrganizer.some(
        (event) => event.eventId === parseInt(eventId, 10)
      )
    ) {
      console.log(
        "addMeToEventGuest",
        400,
        "You are already an Organizer. Remove yourself from organizer list and try again.",
        "Request user:",
        req.user
      );
      return res.status(400).json({
        error:
          "You are already an Organizer. Remove yourself from organizer list and try again",
      });
    }

    await prisma.eventGuests.create({
      data: {
        eventId: parseInt(eventId, 10),
        guestId: guest.id,
      },
    });

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    return res.status(201).json({
      id: event.id,
      name: event.name,
      location: event.location,
      numGuests: event.EventGuests.length,
      guestAdded: {
        id: guest.id,
        utorid: guest.utorid,
        name: guest.name,
      },
      // TODO for test case 61
      pointsRemain: event.pointsRemain,
      pointsAwarded: event.pointsAwarded,
      published: event.published,
    });
  } catch (error) {
    console.log("🚀 ~ addMeToEventGuest ~ error:", error);
    console.log("Request user:", req.user);
    return res.status(500).json({ error: error.message });
  }
};

const removeMeFromEventGuest = async (req, res) => {
  console.log("removeMeFromEventGuest called");
  const { eventId } = req.params;

  try {
    const findEvent = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
        published: true,
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    if (!findEvent) {
      console.log(
        "removeMeFromEventGuest",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    if (new Date(findEvent.endTime) < new Date()) {
      console.log(
        "removeMeFromEventGuest",
        410,
        "Event has already ended.",
        "Request params:",
        req.params
      );
      return res.status(410).json({ error: "Event has already ended." });
    }

    if (!findEvent.EventGuests.some((guest) => guest.guestId === req.user.id)) {
      console.log(
        "removeMeFromEventGuest",
        400,
        "You are not a guest.",
        "Request user:",
        req.user
      );
      return res.status(400).json({ error: "You are not a guest." });
    }

    await prisma.eventGuests.delete({
      where: {
        eventId_guestId: {
          eventId: parseInt(eventId, 10),
          guestId: req.user.id,
        },
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log("🚀 ~ removeMeFromEventGuest ~ error:", error);
    console.log("Request user:", req.user);
    return res.status(500).json({ error: error.message });
  }
};

const createEventTransactionForOneUser = async (
  event,
  amount,
  utorid,
  req,
  res
) => {
  const user = await prisma.user.findUnique({
    where: {
      utorid,
    },
  });

  if (!user) {
    console.log(
      "createEventTransaction",
      404,
      "User not found.",
      "Request body:",
      req.body
    );
    return res.status(404).json({ error: "User not found." });
  }

  if (event.EventGuests.every((guest) => guest.guestId !== user.id)) {
    console.log(
      "createEventTransaction",
      400,
      "The user is not a guest of the event.",
      "Request body:",
      req.body
    );
    return res.status(400).json({
      error: "The user is not a guest of the event.",
    });
  }

  const transaction = await prisma.transaction.create({
    data: {
      points: amount,
      type: TransactionType.event,
      relatedId: event.id,
      user: {
        connect: {
          id: user.id,
        },
      },
      createdByUser: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      points: {
        increment: amount,
      },
    },
  });

  await prisma.event.update({
    where: {
      id: event.id,
    },
    data: {
      pointsRemain: {
        decrement: amount,
      },
      pointsAwarded: {
        increment: amount,
      },
    },
  });

  return res.status(201).json({
    id: transaction.id,
    recipient: user.utorid,
    awarded: transaction.points,
    type: transaction.type,
    relatedId: transaction.relatedId,
    remark: transaction.remark ?? "",
    createdBy: req.user.utorid,
  });
};

const createEventTransactionForAllUsers = async (event, amount, req, res) => {
  const eventGuests = event.EventGuests.map((guest) => guest.guest);

  const transactions = [];

  for (const guest of eventGuests) {
    const transaction = await prisma.transaction.create({
      data: {
        points: amount,
        type: TransactionType.event,
        relatedId: event.id,
        user: {
          connect: {
            id: guest.id,
          },
        },
        createdByUser: {
          connect: {
            id: req.user.id,
          },
        },
      },
      include: {
        user: true,
        createdByUser: true,
      },
    });

    await prisma.user.update({
      where: {
        id: guest.id,
      },
      data: {
        points: {
          increment: amount,
        },
      },
    });

    transactions.push({
      id: transaction.id,
      recipient: transaction.user.utorid,
      awarded: transaction.points,
      type: transaction.type,
      relatedId: transaction.relatedId,
      remark: transaction.remark ?? "",
      createdBy: transaction.createdByUser.utorid,
    });
  }

  await prisma.event.update({
    where: {
      id: event.id,
    },
    data: {
      pointsRemain: {
        decrement: amount * eventGuests.length,
      },
      pointsAwarded: {
        increment: amount * eventGuests.length,
      },
    },
  });

  return res.status(201).json(transactions);
};

const createEventTransaction = async (req, res) => {
  console.log("createEventTransaction called");
  const { eventId } = req.params;
  const { amount, type, utorid } = req.body;

  const amountInt = parseInt(amount, 10);

  if (!amount || !type) {
    console.log(
      "createEventTransaction",
      400,
      "Missing required fields.",
      "Request body:",
      req.body
    );
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (type && type !== TransactionType.event) {
    console.log(
      "createEventTransaction",
      400,
      "Invalid transaction type.",
      "Request body:",
      req.body
    );
    return res.status(400).json({ error: "Invalid transaction type." });
  }

  if (amount && amountInt <= 0) {
    console.log(
      "createEventTransaction",
      400,
      "Amount must be a positive integer.",
      "Request body:",
      req.body
    );
    return res.status(400).json({ error: "Amount must be a positive" });
  }

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(eventId, 10),
      },
      include: {
        EventGuests: {
          include: {
            guest: true,
          },
        },
      },
    });

    if (!event) {
      console.log(
        "createEventTransaction",
        404,
        "Event not found.",
        "Request params:",
        req.params
      );
      return res.status(404).json({ error: "Event not found." });
    }

    if (utorid) {
      if (event.pointsRemain < amountInt) {
        console.log(
          "createEventTransaction",
          400,
          "The event does not have enough points to award.",
          "Request body:",
          req.body
        );
        return res.status(400).json({
          error: "The event does not have enough points to award.",
        });
      }

      return createEventTransactionForOneUser(
        event,
        amountInt,
        utorid,
        req,
        res
      );
    } else {
      const totalPoints = amountInt * event.EventGuests.length;
      if (event.pointsRemain < totalPoints) {
        console.log(
          "createEventTransaction",
          400,
          "The event does not have enough points to award.",
          "Request body:",
          req.body
        );
        return res.status(400).json({
          error: "The event does not have enough points to award.",
        });
      }

      return createEventTransactionForAllUsers(event, amountInt, req, res);
    }
  } catch (error) {
    console.log("🚀 ~ createEventTransaction ~ error:", error);
    console.log("Request body:", req.body);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addEventOrganizer,
  removeEventOrganizer,
  addEventGuest,
  removeEventGuest,
  addMeToEventGuest,
  removeMeFromEventGuest,
  createEventTransaction,
};
