const express = require('express');
const router = express.Router();
const db = require('../db/index');

router.get('/', async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await db.query(
      'INSERT INTO users (first_name, last_name, email, photo, company_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.body.company_id
      ]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id
    ]);
    const jobs = await db.query(
      'SELECT job_id FROM jobs_users WHERE user_id=$1',
      [req.params.id]
    );
    const user = data.rows[0];
    user.jobs = jobs.rows;
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, photo=$4, company_id=$5 WHERE id=$6 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.body.company_id,
        req.params.id
      ]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await db.query('DELETE FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json({ Message: 'User Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

// try {
// } catch (err) {
//   return next(err);
// }
