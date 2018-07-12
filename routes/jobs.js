const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const {
  ensureCorrectUser,
  ensureLoggedIn,
  checkIfCompany
  // checkJobCreator,
} = require('../middleware');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM jobs LIMIT 50');
    console.log(data);
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', checkIfCompany, async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, SECRET_KEY);
    const handle = decodedToken.handle;
    const company = await db.query('SELECT * FROM companies WHERE handle=$1;', [
      handle
    ]);
    const data = await db.query(
      'INSERT INTO jobs (title, salary, equity, company) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.body.title, req.body.salary, req.body.equity, +company.rows[0].id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// router.get('/:id', ensureLoggedIn, async (req, res, next) => {
//   try {
//     const data = db.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
//     return res.json(data.rows[0]);
//   } catch (err) {
//     return next(err);
//   }
// });

// router.patch('/:id', checkJobCreator, async (req, res, next) => {
//   try {
//     const data = await db.query(
//       'UPDATE jobs SET title=($1), salary=($2), equity=($3), company_id=($4) WHERE id=($5) RETURNING *',
//       [
//         req.body.title,
//         req.body.salary,
//         req.body.equity,
//         req.body.company_id,
//         req.params.id
//       ]
//     );
//     return res.json(data.rows[0]);
//   } catch (err) {
//     return next(err);
//   }
// });

// router.delete('/:id', checkJobCreator, async (req, res, next) => {
//   try {
//     const data = await db.query('DELETE FROM jobs WHERE id=$1 RETURNING *', [
//       req.params.id
//     ]);
//     return res.json(data.rows[0]);
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;
