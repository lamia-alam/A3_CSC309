

const verifiedUser = (req, res, next) => {
  if (req.user.verified) {
    next();
  } else {
    return res.status(401).send('Unauthorized');
  }
}

module.exports = verifiedUser;