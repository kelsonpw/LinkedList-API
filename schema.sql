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
    current_company TEXT REFERENCES companies (handle) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    salary TEXT NOT NULL,
    equity FLOAT
);

CREATE TABLE jobs_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs (id) ON DELETE CASCADE
);

INSERT INTO companies (name, email, handle, password) VALUES ('rithm', 'kelson@warner.com','rithm','password');
INSERT INTO companies (name, email, handle, password) VALUES ('hooli', 'hoolo@warner.com','hooli','password');
INSERT INTO users (first_name, last_name, username, email, password, current_company) VALUES ('kelson','warner','kelson','kelson@warner.com','password','rithm');
INSERT INTO users (first_name, last_name, username, email, password, current_company) VALUES ('jimmy','rithm','jimmy','jimmy@rithm.com','password','hooli');
INSERT INTO jobs (title, company, salary, equity) VALUES ('Dev', 1,'$100,000', 0.03);
INSERT INTO jobs (title, company, salary, equity) VALUES ('Dev 2', 2,'$200,000',0.25);
INSERT INTO jobs_users (user_id, job_id) VALUES (1,1);
INSERT INTO jobs_users (user_id, job_id) VALUES (1,2);
INSERT INTO jobs_users (user_id, job_id) VALUES (2,1);
INSERT INTO jobs_users (user_id, job_id) VALUES (2,1);
\q