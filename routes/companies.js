const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';
const {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany
} = require('../middleware');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM companies');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  try {
    const company = await db.query(
      'SELECT * FROM companies WHERE handle=$1 LIMIT 1',
      [req.body.handle]
    );
    if (company.rows.length === 0) {
      return res.json({ message: 'Invalid Handle' });
    }
    const hashedPass = await bcrypt.compare(
      req.body.password,
      company.rows[0].password
    );
    if (hashedPass) {
      const token = jwt.sign({ company_id: company.rows[0].id }, SECRET_KEY);
      return res.json({ token });
    } else {
      return res.json({ message: 'Invalid PW' });
    }
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const company = await db.query('SELECT * FROM companies WHERE id=$1', [
      req.params.id
    ]);
    const users = await db.query(
      'SELECT * FROM users WHERE current_company_id=$1',
      [req.params.id]
    );
    const jobs = await db.query('SELECT * FROM jobs WHERE company_id=$1', [
      req.params.id
    ]);
    company.rows[0].users = users.rows;
    company.rows[0].jobs = jobs.rows;
    return res.json(company.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'INSERT INTO companies (name, logo, handle, password) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.body.name, req.body.logo, req.body.handle, hashedPass]
    );
    delete data.rows[0].password;
    return res.json(data.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return next(`The handle ${req.body.handle} already exists.`);
    return next(err);
  }
});

router.patch('/:id', ensureCorrectCompany, async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'UPDATE companies SET name=($1), logo=($2), handle=($3), password=($4) WHERE id=($5) RETURNING *',
      [req.body.name, req.body.logo, req.body.handle, hashedPass, req.params.id]
    );
    delete data.rows[0].password;
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectCompany, async (req, res, next) => {
  try {
    const data = await db.query(
      'DELETE FROM companies WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return next(`The handle ${req.body.handle} already exists.`);
    return next(err);
  }
});

module.exports = router;
