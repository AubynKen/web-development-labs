// Author: Pinglei He
// Les commentaires ont été faits en Anglais parce que le français n’est pas ma langue maternelle

// module imports
const express = require("express");
const cors = require("cors");

// hard-coded settings
const port = 3000;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/config", (req, res) => {
  res.json({
    "temperature": {
      "state": 1,
      "unit": 0
    },
    "wind": {
      "state": 1,
      "unit": 0
    },
    "visibility": {
      "state": 1,
      "unit": 0
    },
    "sunrise": {
      "state": 1
    },
    "sunset": {
      "state": 1
    },
    "moonrise": {
      "state": 1
    },
    "moonset": {
      "state": 1
    },
    "currWeather": {
      "state": 1
    }
  });
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});