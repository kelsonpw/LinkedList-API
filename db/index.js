const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://localhost/LinkedList-db'
});

client.connect();

module.exports = client;
