process.env.NODE_ENV = 'test';
const db = require('../db');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../index');
const bcrypt = require('bcrypt');
const { SECRET_KEY } = require('../config');

// describe('GET /users', () => {
//   test('It should response with a list of students', async () => {
//     const response = await request(app).get('/users');
//     console.log(response);
//   });
// });

const auth = {};

beforeAll(async () => {
  await db.query(
    `CREATE TABLE companies (
      id SERIAL PRIMARY KEY,
      handle VARCHAR(55) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name VARCHAR(55) NOT NULL,
      email VARCHAR(55) UNIQUE NOT NULL,
      logo TEXT
  )`
  );

  await db.query(
    `CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(55),
      last_name VARCHAR(55),
      username VARCHAR(55) UNIQUE NOT NULL,
      email VARCHAR(55) NOT NULL,
      password TEXT NOT NULL,
      photo TEXT,
      current_company TEXT REFERENCES companies (handle) ON UPDATE CASCADE ON DELETE SET NULL
  )`
  );

  await db.query(`CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL REFERENCES companies (handle) ON UPDATE CASCADE ON DELETE CASCADE,
    salary TEXT NOT NULL,
    equity FLOAT
)`);

  await db.query(`CREATE TABLE jobs_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs (id) ON DELETE CASCADE
)`);
});

beforeEach(async () => {
  // login a user, get a token, store the user ID and token
  const hashedPassword = await bcrypt.hash('secret', 1);
  await db.query(
    "INSERT INTO users (username, email, password) VALUES ('test','test@gmail.com', $1)",
    [hashedPassword]
  );
  const response = await request(app)
    .post('/user-auth')
    .send({
      username: 'test',
      password: 'secret'
    });
  auth.token = response.body.token;
  auth.username = jwt.decode(auth.token).username;

  // do the same for company "companies"
  const hashedCompanyPassword = await bcrypt.hash('secret', 1);
  await db.query(
    "INSERT INTO companies (handle, password,name,email) VALUES ('testcompany', $1, 'company1', 'company@gmail.com')",
    [hashedCompanyPassword]
  );
  const companyResponse = await request(app)
    .post('/company-auth')
    .send({
      handle: 'testcompany',
      password: 'secret'
    });
  auth.company_token = companyResponse.body.token;
  auth.handle = jwt.decode(auth.company_token).handle;

  const decodedToken = jwt.verify(auth.company_token, SECRET_KEY);
  const companyHandle = decodedToken.handle;
  await db.query(
    "INSERT INTO jobs (title, salary, equity, company) VALUES ('developer','$100,000', 0.25, $1)",
    [companyHandle]
  );
});

afterEach(async () => {
  // delete the users and company users
  await db.query('DELETE FROM users');
  await db.query('DELETE FROM companies');
});

afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS jobs_users');
  await db.query('DROP TABLE IF EXISTS jobs');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('DROP TABLE IF EXISTS companies');
  db.end();
});

describe('GET /jobs as a user', () => {
  test('Return a list of jobs', async () => {
    const response = await request(app)
      .get('/jobs')
      .set('authorization', auth.token);
    expect(response.body.length).toBe(1);
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /jobs as a company', () => {
  test('Return a list of jobs', async () => {
    const response = await request(app)
      .get('/jobs')
      .set('authorization', auth.company_token);
    expect(response.body.length).toBe(1);
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /jobs without AUTH', () => {
  test('Requires logging in', async () => {
    const response = await request(app).get('/jobs');
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});

describe('POST /jobs', () => {
  test('It responds with a newly created job', async () => {
    const response = await request(app)
      .post('/jobs')
      .set('authorization', auth.company_token)
      .send({
        title: 'Developer2',
        salary: '$200,000',
        equity: 0.25,
        company: 'testcompany'
      });
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Developer2');
    expect(response.statusCode).toBe(200);
    const res = await request(app)
      .get('/jobs')
      .set('authorization', auth.company_token);
    expect(res.body.length).toBe(2);
  });
});

describe('GET /jobs/:id', () => {
  test('It responds with a single job', async () => {
    const decodedToken = jwt.verify(auth.company_token, SECRET_KEY);
    const companyHandle = decodedToken.handle;
    let jobId = (await db.query('SELECT * FROM jobs WHERE company=$1 LIMIT 1', [
      companyHandle
    ])).rows[0].id;
    const response = await request(app)
      .get(`/jobs/${jobId}`)
      .set('authorization', auth.company_token);
    expect(response.body).toHaveProperty('id');
    expect(response.statusCode).toBe(200);
  });
});

describe('PATCH /jobs/:id', () => {
  test('It responds with an updated job', async () => {
    const decodedToken = jwt.verify(auth.company_token, SECRET_KEY);
    const companyHandle = decodedToken.handle;
    let jobId = (await db.query('SELECT * FROM jobs WHERE company=$1 LIMIT 1', [
      companyHandle
    ])).rows[0].id;
    const updatedJob = await request(app)
      .patch(`/jobs/${jobId}`)
      .set('authorization', auth.company_token)
      .send({
        title: 'Developer3',
        salary: '$1,000,000',
        equity: 0.999
      });
    console.log(updatedJob.body);
    expect(updatedJob.body.title).toBe('Developer3');
    expect(updatedJob.body).toHaveProperty('id');
    expect(updatedJob.statusCode).toBe(200);
  });
});

describe('DELETE /jobs/:id', () => {
  test('It deletes the job properly.', async () => {
    const decodedToken = jwt.verify(auth.company_token, SECRET_KEY);
    const companyHandle = decodedToken.handle;
    const jobId = (await db.query(
      'SELECT * FROM jobs WHERE company=$1 LIMIT 1',
      [companyHandle]
    )).rows[0].id;
    const deletedJob = await request(app)
      .delete(`/jobs/${jobId}`)
      .set('authorization', auth.company_token);
    expect(deletedJob.statusCode).toBe(200);
    expect(deletedJob.body.company).toBe(companyHandle);
    const secondDelete = await request(app)
      .delete(`/jobs/${jobId}`)
      .set('authorization', auth.company_token);
    console.log('ERROR=>', secondDelete.error, 'enderror');
    expect(secondDelete.body.title).toBe('Job does not exist.');
    //console.log(secondDelete.body);
  });
});
