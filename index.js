const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'coolsecretkey';

const usersRoutes = require('./routes/users');
// const companiesRoutes = require('./routes/companies');
// const jobsRoutes = require('./routes/jobs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/users', usersRoutes);
// app.use('/companies', companiesRoutes);
// app.use('/jobs', jobsRoutes);
// app.use(cors());

app.post('/user-auth', async (req, res, next) => {
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
});

app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.json({
      message: err.message,
      error: err
    });
  });
}

app.listen(PORT, () => {
  console.log(`server starting on port ${PORT}`);
});
