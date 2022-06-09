// Author: Pinglei He

const express = require("express");
const cors = require("cors");
const db = require("./db.js");

const port = 3000;

const app = express();
app.use(express.json());
app.use(cors());

// let userConfig = {
//   "temperature": {
//     "state": 1, "unit": 0
//   }, "wind": {
//     "state": 1, "unit": 0
//   }, "visibility": {
//     "state": 1, "unit": 0
//   }, "sunrise": {
//     "state": 1
//   }, "sunset": {
//     "state": 1
//   }, "moonrise": {
//     "state": 1
//   }, "moonset": {
//     "state": 1
//   }, "currWeather": {
//     "state": 1
//   }
// };


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/config", (req, res) => {
  db.get("SELECT * FROM config", (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error, something went wrong with the database.");
    } else {
      console.log("Config fetched from database and sent back to user.");
      res.json(row.value);
    }
  })
});

// n.b. If I was to send the data through the form directly I would use post since put isn't available for a form
// Here I manually send the data with javascript, and the request is idempotent so I'm using put instead of post
app.put("/config", async (req, res) => {
  const userConfig = req.body;
  db.run("UPDATE config SET value = ?", JSON.stringify(userConfig), (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error, something went wrong with the database.");
    } else {
      console.log("Config updated");
      res.send("Configuration updated.");
    }
  })
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});