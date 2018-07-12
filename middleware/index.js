const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const db = require('../db/index');

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
    if (decodedToken.username === req.params.username) {
      return next();
    } else {
      return res.json({
        message: 'You must the account owner to update the profile.'
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    if (decodedToken.handle === req.params.handle) {
      return next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }
  } catch (err) {
    return next(err);
  }
}

function checkIfCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    if (decodedToken.handle) {
      return next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized to Post Job'
      });
    }
  } catch (err) {
    return next(err);
  }
}

async function checkJobCreator(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    const job = await db.query('SELECT * FROM jobs WHERE id=$1', [
      req.params.id
    ]);
    const companyHandle = job.rows[0].company;
    if (decodedToken.handle === companyHandle) {
      return next();
    } else {
      return res.status(401).json({
        error: {
          status: 401,
          title: 'Unauthorized',
          message: 'You need to authenticate before accessing this resource.'
        }
      });
    }
  } catch (err) {
    return res.status(404).json({
      error: {
        status: 404,
        title: 'Not Found',
        message: 'Record with that ID was not found.'
      }
    });
  }
}

module.exports = {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany,
  checkIfCompany,
  checkJobCreator
};
