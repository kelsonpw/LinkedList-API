const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const APIError = require('../APIError');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware');
const { validate } = require('jsonschema');
const userSchema = require('../userSchema.json');
// const { applications } = require('../functions');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users LIMIT 50');
    for (let i = 0; i < data.rows.length; i++) {
      const jobs = await db.query('SELECT * FROM jobs_users WHERE user_id=$1', [
        data.rows[i].id
      ]);
      jobIds = jobs.rows.map(job => job.job_id);
      data.rows[i].applied_to = jobIds;
      delete data.rows[i].password;
    }
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const result = validate(req.body, userSchema);
    console.log(result);
    if (!result.valid) {
      return next(
        new APIError(
          400,
          'You made an error:',
          result.errors.map(e => e.stack).join('. ')
        )
      );
    }

    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const company = await db.query(
      'SELECT * FROM companies WHERE handle=$1 LIMIT 1',
      [req.body.current_company]
    );
    let current_company = null;
    if (company.rows.length > 0) current_company = company.rows[0].handle;
    const data = await db.query(
      'INSERT INTO users (username, password, first_name, last_name, email, photo, current_company) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [
        req.body.username,
        hashedPass,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        current_company
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

router.get('/:username', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users WHERE username=$1', [
      req.params.username
    ]);
    const jobs = await db.query('SELECT * FROM jobs_users WHERE user_id=$1', [
      data.rows[0].id
    ]);
    jobIds = jobs.rows.map(job => job.job_id);
    data.rows[0].applied_to = jobIds;
    delete data.rows[0].password;
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    if (req.body.password.length > 55)
      return next(new Error('Password is too long'));
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const company = await db.query(
      'SELECT * FROM companies WHERE handle=$1 LIMIT 1',
      [req.body.current_company]
    );
    let current_company = null;
    if (company.rows.length > 0) current_company = company.rows[0].handle;
    const data = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, username=$4, password=$5, photo=$6, current_company=$7 WHERE username=$4 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.username,
        hashedPass,
        req.body.photo,
        current_company
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
    const data = await db.query(
      'DELETE FROM users WHERE username=$1 RETURNING *',
      [req.params.username]
    );
    console.log(data);
    const jobs = await db.query('SELECT * FROM jobs_users WHERE user_id=$1', [
      data.rows[0].id
    ]);
    jobIds = jobs.rows.map(job => job.job_id);
    data.rows[0].applied_to = jobIds;
    delete data.rows[0].password;
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
