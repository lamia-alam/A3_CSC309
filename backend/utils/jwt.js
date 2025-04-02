const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10;
const SECRET_KEY = 'kjdfajsdhrfefghjweoihjfoei';

const hashedPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds)
}

const comparePassword =  (password, hash) => {
    return  bcrypt.compareSync(password, hash)
}


const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
}


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;


module.exports = {
    hashedPassword,
    comparePassword,
    verifyToken,
    SECRET_KEY,
    passwordRegex
}