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

// async function checkJobCreator(req, res, next) {
//   try {
//     const token = req.headers.authorization;
//     const decodedToken = jwt.verify(token, SECRET_KEY);
//     const job = await db.query('SELECT * FROM jobs WHERE id=$1', [
//       req.params.id
//     ]);
//     const jobCompany = job.rows[0].company_id;
//     if (decodedToken.company_id === jobCompany) {
//       return next();
//     } else {
//       return res.status(401).json({ message: 'not the correct company' });
//     }
//   } catch (err) {
//     return next(err);
//   }
// }

module.exports = {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany,
  checkIfCompany
  // checkJobCreator
};
