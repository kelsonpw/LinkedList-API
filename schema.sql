DROP DATABASE IF EXISTS  "users-db";
CREATE DATABASE "users-db";
\c "users-db"
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    password NOT NULL,
    name TEXT,
    logo TEXT
);
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    salary TEXT,
    equity FLOAT,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    photo TEXT,
    company_id INTEGER REFERENCES companies (id) ON DELETE SET NULL
);
CREATE TABLE jobs_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    job_ib INTEGER REFERENCES companies (id) ON DELETE CASCADE
);
\q