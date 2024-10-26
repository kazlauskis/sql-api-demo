const express = require("express");
const parser = require("pgsql-parser");
const schema = require("./schema");
const path = require("path");
const app = express();

app.use(express.static("public"));

// app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/query", (req, res) => {
  let parsed;
  let deparsed;
  try {
    parsed = parser.parse(req.query.q);
    try {
      schema.parse(parsed);
      deparsed = parser.deparse(parsed, {});
    } catch (error) {
      console.log(JSON.stringify(parsed, null, 4));
      console.log(error);
      deparsed = `now allowed`;
    }
  } catch (error) {
    // ignore
  }

  res.send({ parsed, deparsed });
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
