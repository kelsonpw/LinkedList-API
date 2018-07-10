const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  try {
    const user = await db.query(
      'SELECT * FROM users WHERE username=$1 LIMIT 1',
      [req.body.username]
    );
    if (user.rows.length === 0) {
      return res.json({ message: 'Invalid Username/Username not found' });
    }
    const hashedPass = await bcrypt.compare(
      req.body.password,
      user.rows[0].password
    );
    if (hashedPass) {
      const token = jwt.sign({ user_id: user.rows[0].id }, SECRET_KEY);
      return res.json({ token });
    } else {
      return res.json({ message: 'Invalid PW' });
    }
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'INSERT INTO users (username, password, first_name, last_name, email, photo, current_company_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [
        req.body.username,
        hashedPass,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.body.current_company_id
      ]
    );
    delete data.rows[0].password;
    return res.json(data.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return next(`The username ${req.body.username} already exists.`);
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
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

router.patch('/:id', ensureCorrectUser, async (req, res, next) => {
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

router.delete('/:id', ensureCorrectUser, async (req, res, next) => {
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
