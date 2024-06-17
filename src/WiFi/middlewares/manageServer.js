const manageWiFi = require("../WiFi");
const eventEmitter = require("./eventHandler");
let server = null;

eventEmitter.on("startManageWiFi", (hostname, port) => {
  startManageWiFi(hostname, port);
});

eventEmitter.on("stopManageWiFi", async () => {
  await stopManageWiFi();
});

function startManageWiFi(hostname, port) {
  if (!server) {
    server = manageWiFi.listen(port, hostname, () => {
      console.log(
        `WiFi management server running on http://${hostname}:${port}`
      );
    });
  } else {
    console.log("WiFi management server already running");
  }
}

async function stopManageWiFi() {
  try {
    if (server) {
      await server.close();
      server = null;
      console.log("WiFi management server stopped");
    } else {
      console.log("WiFi management server already stopped");
    }
  } catch (error) {
    console.error("Error stopping WiFi management server:", error);
  }
}

module.exports = { startManageWiFi, stopManageWiFi };
