const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    return next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    if (decodedToken.user_id === +req.params.id) {
      return next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }
    return next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
}

module.exports = {
  ensureCorrectUser,
  ensureLoggedIn
};
