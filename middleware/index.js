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

function ensureCorrectCompany(req, res, next) {
  try {
    const token = req.headesrs.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    if (decodedToken.company_id === +req.params.id) {
      return next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }
  } catch (err) {
    return res.status(401).json({ message: 'unauthorized company' });
  }
}

function checkIfCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    if (decodedToken.company_id) {
      return next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized to Post Job'
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized to Post Job'
    });
  }
}

async function checkJobCreator(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    const job = await db.query('SELECT * FROM jobs WHERE id=$1', [
      req.params.id
    ]);
    const jobCompany = job.rows[0].company_id;
    if (decodedToken.company_id === jobCompany) {
      return next();
    } else {
      return res.status(401).json({ message: 'not the correct company' });
    }
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany,
  checkIfCompany,
  checkJobCreator
};
