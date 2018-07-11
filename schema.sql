DROP DATABASE IF EXISTS  "LinkedList-db";
CREATE DATABASE "LinkedList-db";
\c "LinkedList-db"
-- CREATE TABLE companies (
--     id SERIAL PRIMARY KEY,
--     handle TEXT UNIQUE NOT NULL,
--     password NOT NULL,
--     name TEXT,
--     logo TEXT
-- );
-- CREATE TABLE jobs (
--     id SERIAL PRIMARY KEY,
--     title TEXT,
--     salary TEXT,
--     equity FLOAT,
--     company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE
-- );
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(55),
    last_name VARCHAR(55),
    username VARCHAR(55) UNIQUE NOT NULL,
    email VARCHAR(55) NOT NULL,
    password text NOT NULL,
    photo TEXT
);
-- CREATE TABLE jobs_users (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
--     job_ib INTEGER REFERENCES companies (id) ON DELETE CASCADE
-- );
INSERT INTO users (first_name, last_name, username, email, password) VALUES ('kelson','warner','kelsonw','kelson@warner.com','password')
\q