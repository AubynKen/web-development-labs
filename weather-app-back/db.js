const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('weather.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the weather database.');
});
const fs = require('fs');

module.exports = db;