const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const jobsRoutes = require('./routes/jobs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/users', usersRoutes);
app.use('/companies', companiesRoutes);
app.use('/jobs', jobsRoutes);
// app.use(cors());

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
