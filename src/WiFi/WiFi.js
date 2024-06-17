const express = require("express");

const path = require("path");
const bodyParser = require("body-parser");
const router = require("./routes/routes");

const manageWiFi = express();

// Middleware to parse form data
manageWiFi.use(bodyParser.json());
manageWiFi.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
manageWiFi.use(express.static(path.join(__dirname, "/public")));

manageWiFi.set("view engine", "ejs");
manageWiFi.set("views", path.join(__dirname, "/views"));

manageWiFi.use("/", router);
manageWiFi.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.send("Something went wrong!");
});

module.exports = manageWiFi;
