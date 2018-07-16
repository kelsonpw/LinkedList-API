const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const APIError = require('../APIError');
const companySchema = require('../schemas/companySchema');
const { validate } = require('jsonschema');
const { SECRET_KEY } = require('../config');
const {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany
} = require('../middleware');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM companies');
    for (let i = 0; i < data.rows.length; i++) {
      const users = await db.query(
        'SELECT * FROM users WHERE current_company=$1',
        [data.rows[i].handle]
      );
      const jobs = await db.query('SELECT * FROM jobs WHERE company=$1', [
        data.rows[i].handle
      ]);
      data.rows[i].employees = users.rows.map(v => v.username);
      data.rows[i].jobs = jobs.rows.map(v => v.id);
      delete data.rows[i].password;
    }
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  const result = validate(req.body, companySchema);
  console.log(result);
  if (!result.valid) {
    return next(
      new APIError(
        400,
        'You made an error creating a company:',
        result.errors.map(e => e.stack).join('. ')
      )
    );
  }

  try {
    // if (req.body.password.length > 55)
    //   return next(new Error('Password is too long'));
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'INSERT INTO companies (name, email, handle, password, logo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [
        req.body.name,
        req.body.email,
        req.body.handle,
        hashedPass,
        req.body.logo
      ]
    );
    data.rows[0].password = req.body.password;
    return res.json(data.rows[0]);
  } catch (err) {
    console.log('err', err, 'status', err.status);

    if (err.code === '23505') {
      return next(
        new APIError(400, 'The company cannot be created', err.detail)
      );
    } else {
      return next(err);
    }
  }
});

router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
  try {
    const company = await db.query(
      'SELECT * FROM companies WHERE handle=$1 LIMIT 1',
      [req.params.handle]
    );
    const users = await db.query(
      'SELECT * FROM users WHERE current_company=$1',
      [req.params.handle]
    );
    const jobs = await db.query('SELECT * FROM jobs WHERE company=$1', [
      req.params.handle
    ]);
    company.rows[0].employees = users.rows.map(v => v.username);
    company.rows[0].jobs = jobs.rows.map(v => v.id);

    delete company.rows[0].password;
    return res.json(company.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:handle', ensureCorrectCompany, async (req, res, next) => {
  req.body.handle = req.params.handle;
  const result = validate(req.body, companySchema);
  console.log(result);
  if (!result.valid) {
    return next(
      new APIError(
        400,
        'You made an error patching the company:',
        result.errors.map(e => e.stack).join('. ')
      )
    );
  }

  try {
    // if (req.body.password.length > 55)
    //   return next(new Error('Password is too long'));
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const company = await db.query(
      'UPDATE companies SET name=($1), logo=($2), handle=($3), password=($4), email=($5) WHERE handle=($3) RETURNING *',
      [
        req.body.name,
        req.body.logo,
        req.params.handle,
        hashedPass,
        req.body.email
      ]
    );
    company.rows[0].password = req.body.password;
    const users = await db.query(
      'SELECT * FROM users WHERE current_company=$1',
      [req.params.handle]
    );
    const jobs = await db.query('SELECT * FROM jobs WHERE company=$1', [
      req.params.handle
    ]);
    company.rows[0].employees = users.rows.map(v => v.username);
    company.rows[0].jobs = jobs.rows.map(v => v.id);
    return res.json(company.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return next(
        new APIError(400, 'The company cannot be created', err.detail)
      );
    } else {
      return next(err);
    }
  }
});

router.delete('/:handle', ensureCorrectCompany, async (req, res, next) => {
  try {
    const company = await db.query(
      'DELETE FROM companies WHERE handle=$1 RETURNING *',
      [req.params.handle]
    );
    company.rows[0].password = req.body.password;
    const users = await db.query(
      'SELECT * FROM users WHERE current_company=$1',
      [req.params.handle]
    );
    const jobs = await db.query('SELECT * FROM jobs WHERE company=$1', [
      req.params.handle
    ]);
    company.rows[0].employees = users.rows.map(v => v.username);
    company.rows[0].jobs = jobs.rows.map(v => v.id);
    return res.json(company.rows[0]);
  } catch (err) {
    return next(
      new APIError(
        404,
        'This is not a valid company',
        'Please login for more information.'
      )
    );
  }
});

module.exports = router;
