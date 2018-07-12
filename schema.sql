DROP DATABASE IF EXISTS  "LinkedList-db";
CREATE DATABASE "LinkedList-db";
\c "LinkedList-db"


CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(55) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(55) NOT NULL,
    email VARCHAR(55) UNIQUE NOT NULL,
    logo TEXT
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(55),
    last_name VARCHAR(55),
    username VARCHAR(55) UNIQUE NOT NULL,
    email VARCHAR(55) NOT NULL,
    password TEXT NOT NULL,
    photo TEXT,
    current_company TEXT REFERENCES companies (handle) ON UPDATE CASCADE ON DELETE CASCADE
);

-- CREATE TABLE jobs (
--     id SERIAL PRIMARY KEY,
--     title TEXT,
--     salary TEXT,
--     equity FLOAT,
--     company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE
-- );

-- CREATE TABLE jobs_users (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
--     job_ib INTEGER REFERENCES companies (id) ON DELETE CASCADE
-- );
INSERT INTO users (first_name, last_name, username, email, password) VALUES ('kelson','warner','jimmy','kelson@warner.com','password');
INSERT INTO companies (name, email, handle, password) VALUES ('rithm', 'kelson@warner.com','rithm','password');
\q