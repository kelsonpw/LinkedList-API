const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const APIError = require('./APIError');
process.env.NODE_ENV = 'development';
//const key = 'dsadsa';

const { SECRET_KEY } = require('./config');
// const db = require('./db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const jobsRoutes = require('./routes/jobs');

const { userAuthHandler, companyAuthHandler } = require('./auth');
app.post('/user-auth', userAuthHandler);
app.post('/company-auth', companyAuthHandler);

app.use('/users', usersRoutes);
app.use('/companies', companiesRoutes);
app.use('/jobs', jobsRoutes);
// app.use(cors());

// app.post('/user-auth', async (req, res, next) => {
//   try {
//     const user = await db.query(
//       'SELECT * FROM users WHERE username=$1 LIMIT 1',
//       [req.body.username]
//     );
//     if (user.rows.length === 0) {
//       return next(new Error('User does not exist'));
//     }
//     const checkPassword = await bcrypt.compare(
//       req.body.password,
//       user.rows[0].password
//     );
//     if (checkPassword) {
//       const token = jwt.sign({ username: user.rows[0].username }, SECRET_KEY);
//       return res.json({ token });
//     } else {
//       return res.json({ message: 'Invalid Password' });
//     }
//   } catch (e) {
//     return next(e);
//   }
// });

// app.post('/company-auth', async (req, res, next) => {
//   try {
//     const company = await db.query(
//       'SELECT * FROM companies WHERE handle=$1 LIMIT 1',
//       [req.body.handle]
//     );
//     if (company.rows.length === 0) {
//       return res.json({ message: 'Invalid Handle' });
//     }
//     const hashedPass = await bcrypt.compare(
//       req.body.password,
//       company.rows[0].password
//     );
//     if (hashedPass) {
//       const token = jwt.sign({ handle: company.rows[0].handle }, SECRET_KEY);
//       return res.json({ token });
//     } else {
//       return res.json({ message: 'Invalid PW' });
//     }
//   } catch (err) {
//     return next(err);
//   }
// });

// app.use((req, res, next) => {
//   var err = new Error('Not Found');
//   err.status = 404;
//   return next(err);
// });

// if (app.get('env') === 'development') {
//   app.use((err, req, res, next) => {
//     res.status(err.status || 500);
//     return res.json({
//       message: err.message,
//       error: err
//     });
//   });
// }

app.use((error, request, response, next) => {
  // format built-in errors
  if (!(error instanceof APIError)) {
    error = new APIError(500, error.type, error.message);
  }
  // log the error stack if we're in development
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack); //eslint-disable-line no-console
  }

  return response.status(error.status).json(error);
});

app.listen(PORT, () => {
  console.log(`server starting on port ${PORT}`);
});

// module.exports = key;
