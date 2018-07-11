const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users LIMIT 50');
    for (let i = 0; i < data.rows.length; i++) {
      delete data.rows[i].password;
    }
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (req.body.password.length > 55)
      return next(new Error('Password is too long'));
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'INSERT INTO users (username, password, first_name, last_name, email, photo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [
        req.body.username,
        hashedPass,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo
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

router.post('/user-auth', async (req, res, next) => {
  try {
    const user = await db.query(
      'SELECT * FROM users WHERE username=$1 LIMIT 1',
      [req.body.username]
    );
    if (user.rows.length === 0) {
      return next(new Error('User does not exist'));
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      user.rows[0].password
    );
    if (checkPassword) {
      const token = jwt.sign({ user_id: user.rows[0].id }, SECRET_KEY);
      return res.json({ token });
    } else {
      return res.json({ message: 'Invalid Password' });
    }
  } catch (e) {
    return next(e);
  }
});

router.get('/:username', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users WHERE username=$1', [
      req.params.username
    ]);
    // const jobs = await db.query(
    //   'SELECT job_id FROM jobs_users WHERE user_id=$1',
    //   [req.params.id]
    // );
    delete data.rows[0].password;
    const user = data.rows[0];
    // user.jobs = jobs.rows;
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    if (req.body.password.length > 55)
      return next(new Error('Password is too long'));
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, username=$4, password=$5, photo=$6 WHERE username=$4 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.username,
        hashedPass,
        req.body.photo
      ]
    );
    data.rows[0].password = req.body.password;
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const data = await db.query('DELETE FROM users WHERE username=$1', [
      req.params.username
    ]);
    return res.json({ Message: 'User Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
