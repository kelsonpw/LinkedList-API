const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM companies');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
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
    const data = await db.query(
      'INSERT INTO companies (name, logo) VALUES ($1,$2) RETURNING *',
      [req.body.name, req.body.logo]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const data = await db.query(
      'UPDATE companies SET name=($1), logo=($2) WHERE id=($3) RETURNING *',
      [req.body.name, req.body.logo, req.params.id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await db.query(
      'DELETE FROM companies WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
