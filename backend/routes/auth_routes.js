const express = require("express");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma_client");
const { hashedPassword, comparePassword, SECRET_KEY, passwordRegex } = require("../utils/jwt");
const { TokenType } = require("@prisma/client");
const router = express.Router();

// TODO 429 too many requests implement rate limiting
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_REQUESTS = 1;

const rateLimiter = (req, res) => {
  const ip = req.ip;
  const currentTime = Date.now();

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, startTime: currentTime };
  } else {
    rateLimit[ip].count += 1;
  }

  if (rateLimit[ip].count > MAX_REQUESTS) {
    if (currentTime - rateLimit[ip].startTime < RATE_LIMIT_WINDOW) {
      return res.status(429).json({ message: "Too many requests" });
    } else {
      rateLimit[ip] = { count: 1, startTime: currentTime };
    }
  }
};

router.post("/resets", async (req, res) => {
  try {
    const { utorid } = req.body;

    if (!utorid) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // find the user exists
    const user = await prisma.user.findUnique({
      where: {
        utorid,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate reset token
    const token = uuid.v4();
    const expiryDate = new Date();
    expiryDate.setMilliseconds(0);
    rateLimiter(req, res);
    
    // find if there is an existing token
    const existingToken = await prisma.token.findFirst({
      where: {
        userId: user.id,
        type: TokenType.RESET_TOKEN,
      },
    });
    
    if (existingToken) {
      // expire the existing token
      await prisma.token.update({
        where: {
          id: existingToken.id,
        },
        data: {
          expiresAt: expiryDate,
        },
      });
    }
    
    expiryDate.setHours(expiryDate.getHours() + 1);
    // save token in the database
    await prisma.token.create({
      data: {
        token: token,
        type: TokenType.RESET_TOKEN,
        expiresAt: expiryDate,
        userId: user.id,
      },
    });

    // send email with token
    return res.status(202).json({
      expiresAt: expiryDate,
      resetToken: token,
    });
  } catch (error) {
    console.error("Error in POST /resets:", error);
    console.error("Request body:", req.body);
    return res.status(500).json({ message: "Internal server error" });
  }
});

let counter = 0

router.post("/resets/:resetToken", async (req, res) => {
  counter ++;
  try {
    const now = new Date();
    now.setMilliseconds(0);
    const { resetToken } = req.params;
    const { utorid, password } = req.body;

    if (!utorid || !password || !resetToken) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }


    // find the token
    const token = await prisma.token.findFirst({
      where: {
        token: resetToken,
        type: TokenType.RESET_TOKEN,
      },
      include: {
        user: true,
      },
    });

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (token.user.utorid !== utorid) {
      return res.status(401).json({ message: "User does not match token" });
    }
    
    // check if token is expired
    if (token.expiresAt <= now) {
      return res.status(410).json({ message: "Token expired" });
    }

    const hashedPasswordValue = await hashedPassword(password);

    // update the password
    await prisma.user.update({
      where: {
        id: token.userId,
      },
      data: {
        password: hashedPasswordValue,
      },
    });

    // delete the token
    // await prisma.token.delete({
    //   where: {
    //     id: token.id,
    //   },
    // });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in POST /resets/:resetToken:", error);
    console.error("Request body:", req.body);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/tokens", async (req, res) => {
  try {
    const { utorid, password } = req.body;

    if (!utorid || !password) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await prisma.user.findUnique({
      where: {
        utorid,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "User has no password" });
    }

    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, utorid, role: user.role, verified: user.verified },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const decodedToken = jwt.decode(token);
    
    const tokenData = await prisma.token.create({
      data: {
      token: token,
      type: "ACCESS_TOKEN",
      expiresAt: new Date(decodedToken.exp * 1000),
      userId: user.id,
      },      
    });

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        activated: true,
        lastLogin: new Date()
      }
    })

    return res.status(200).json({ token, expiresAt: tokenData.expiresAt });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
