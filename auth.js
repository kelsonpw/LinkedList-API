const db = require('./db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const APIError = require('./APIError');
const { SECRET_KEY } = require('./config');

//const key = require('./index')

async function userAuthHandler(req, res, next) {
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
      const token = jwt.sign({ username: user.rows[0].username }, SECRET_KEY);
      return res.json({ token });
    } else {
      return res.json({ message: 'Invalid Password' });
    }
  } catch (e) {
    return next(e);
  }
}

async function companyAuthHandler(req, res, next) {
  try {
    //console.log(req.body);
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
      const token = jwt.sign({ handle: company.rows[0].handle }, SECRET_KEY);
      return res.json({ token });
    } else {
      return res.json({ message: 'Invalid PW' });
    }
  } catch (err) {
    return next(err);
  }
}

module.exports = { userAuthHandler, companyAuthHandler };
