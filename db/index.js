const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://localhost/users-db'
});

client.connect();

module.exports = client;
