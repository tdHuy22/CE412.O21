const { checkInternetConnection } = require("./internet");
const { getIpAddress } = require("./getIpAddress");
const { turnOnAccessPoint } = require("./accessPoint");
const { stopWebRTC } = require("../../WebRTC/WebRTC");
const { closeChromium } = require("./Screen");
const eventEmitter = require("./eventHandler");

require("dotenv").config();

const WiFiPort = process.env.WIFIPORT || 3000;
let checkInterval = null;

async function startInternetCheck() {
  if (checkInterval !== null) return; // If it's already running, do nothing

  checkInterval = setInterval(async () => {
    const isInternetConnected = await checkInternetConnection();
    if (!isInternetConnected) {
      console.log("Internet disconnected. Stopping checks.");
      clearInterval(checkInterval);
      checkInterval = null;
      stopWebRTC();
      closeChromium();
      await turnOnAccessPoint();
      const ipAddress = await getIpAddress();
      eventEmitter.emit("startManageWiFi", ipAddress, WiFiPort);
    } else {
      console.log("Internet connected. Running checks.");
    }
  }, 15000); // Check every 60 seconds
}

async function resumeInternetCheck() {
  const isInternetConnected = await checkInternetConnection();
  if (checkInterval === null && isInternetConnected) {
    console.log("Internet reconnected. Resuming checks.");
    await startInternetCheck();
  }
}

module.exports = { startInternetCheck, resumeInternetCheck };
