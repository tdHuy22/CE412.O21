const { startManageWiFi } = require("./src/WiFi/middlewares/manageServer");
const { startWebRTC } = require("./src/WebRTC/WebRTC");
const { startInternetCheck } = require("./src/WiFi/middlewares/internetCheck");
const { checkInternetConnection } = require("./src/WiFi/middlewares/internet");
const { getIpAddress } = require("./src/WiFi/middlewares/getIpAddress");
const { openChromium } = require("./src/WiFi/middlewares/Screen");
const { turnOnAccessPoint } = require("./src/WiFi/middlewares/accessPoint");
require("dotenv").config();

const WiFiPort = process.env.WIFIPORT || 3000;
const WebRtcPort = process.env.WEBPORT || 8000;

async function main() {
  const isInternetConnected = await checkInternetConnection();
  if (!isInternetConnected) {
    console.log("Internet disconnected. Starting access point.");
    await turnOnAccessPoint();
    const ipAddressWiFi = await getIpAddress();
    startManageWiFi(ipAddressWiFi, WiFiPort);
  } else {
    console.log("Internet connected. Starting WebRTC server.");
    const ipAddressWeb = await getIpAddress();
    startWebRTC(ipAddressWeb, WebRtcPort);
    startInternetCheck();
    openChromium();
  }
}

main();
