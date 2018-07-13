process.env.NODE_ENV = 'test';
const db = require('../db');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../index');
const bcrypt = require('bcrypt');

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

describe('GET /companies', () => {
  test('Return a list of companies', async () => {
    const response = await request(app)
      .get('/companies')
      .set('authorization', auth.company_token);
    expect(response.body.length).toBe(1);
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /companies without AUTH', () => {
  test('Requires logging in', async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});

describe('POST /companies', () => {
  test('It responds with a newly created company', async () => {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'company2',
        name: 'company2',
        email: 'company2@gmail.com',
        password: 'password'
      });
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('company2@gmail.com');
    expect(response.statusCode).toBe(200);
    const res = await request(app)
      .get('/companies')
      .set('authorization', auth.company_token);
    expect(res.body.length).toBe(2);
  });
});

describe('GET /companies/:handle', () => {
  test('It responds with a single company', async () => {
    const response = await request(app)
      .get('/companies/testcompany')
      .set('authorization', auth.company_token);
    expect(response.body).toHaveProperty('id');
    expect(response.statusCode).toBe(200);
  });
});

describe('PATCH /companies/:handle', () => {
  test('It responds with an updated company', async () => {
    const updatedCompany = await request(app)
      .patch('/companies/testcompany')
      .set('authorization', auth.company_token)
      .send({
        name: 'rithm',
        logo: 'logo',
        email: 'rithm@gmail.com',
        password: 'secret'
      });
    console.log(updatedCompany.body);
    expect(updatedCompany.body.email).toBe('rithm@gmail.com');
    expect(updatedCompany.body).toHaveProperty('id');
    expect(updatedCompany.statusCode).toBe(200);
  });
});

describe('DELETE /companies/:handle', () => {
  test('It deletes the company properly.', async () => {
    const deletedCompany = await request(app)
      .delete('/companies/testcompany')
      .set('authorization', auth.company_token);
    expect(deletedCompany.statusCode).toBe(200);
    expect(deletedCompany.body.handle).toBe('testcompany');
    //console.log(deletedUser.body);
    const secondDelete = await request(app)
      .delete('/companies/testcompany')
      .set('authorization', auth.company_token);
    expect(secondDelete.body.title).toBe('This is not a valid company');
    //console.log(secondDelete.body);
  });
});
