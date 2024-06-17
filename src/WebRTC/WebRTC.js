const { readFileSync } = require("fs");
const { join } = require("path");
const { createServer } = require("https");
const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const { socketIO } = require("./middlewares/socketIO");
require("dotenv").config();

const webRTCRoute = require("./routes/webRTCRoute");
// ==================================== IMPORTS ====================================
const app = express();

const key = readFileSync(join(__dirname, "./ssl/key.pem"));
const cert = readFileSync(join(__dirname, "./ssl/cert.pem"));

const httpsServer = createServer({ key, cert }, app);

const io = new Server(httpsServer, {
  cors: {
    // origin: [
    //   "https://localhost",
    //   "https://192.168.1.10",
    //   "https://192.168.1.8",
    //   "https://192.168.1.2",
    // ],
    methods: ["GET", "POST"],
  },
});
// ================================ ASSIGN_VARIABLES ===============================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.use(
  express.static(join(__dirname, "public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.set("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.set("Content-Type", "text/css");
      } else if (path.endsWith(".png")) {
        res.set("Content-Type", "image/png");
      } else if (path.endsWith(".jpg")) {
        res.set("Content-Type", "image/jpg");
      } else if (path.endsWith(".ico")) {
        res.set("Content-Type", "image/ico");
      } else if (path.endsWith(".svg")) {
        res.set("Content-Type", "image/svg");
      } else if (path.endsWith(".json")) {
        res.set("Content-Type", "application/json");
      }
    },
  })
);

app.use("/", webRTCRoute);
// =================================== MIDDLEWARE ==================================

socketIO(io);

// ================================== SOCKET.IO ====================================

function startWebRTC(hostname, port) {
  httpsServer.listen(port, hostname, () => {
    console.log(`WebRTC server running on https://${hostname}:${port}`);
    console.log(`WebRTC server running on https://${hostname}:${port}/screen`);
  });
}

function stopWebRTC() {
  httpsServer.close();
  console.log("WebRTC server stopped");
}
// =================================== SERVER ======================================

module.exports = { startWebRTC, stopWebRTC };
