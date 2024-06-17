const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);
const { checkInternetConnection, scanForWiFiNetworks } = require("./internet");
const { resumeInternetCheck } = require("./internetCheck");
const { getIpAddress } = require("./getIpAddress");
const { startWebRTC } = require("../../WebRTC/WebRTC");
const { openChromium } = require("./Screen");

const eventEmitter = require("./eventHandler");

const WebRtcPort = process.env.WEBPORT || 8000;

async function userIndex(req, res) {
  const WiFi_List = await scanForWiFiNetworks();
  res.render("index", { WiFi_List });
}

function userScan(req, res) {
  res.redirect("/");
}

async function userConnect(req, res) {
  const selectedWifi = req.body.wifi;
  const password = req.body.password;

  try {
    console.log("Connecting to Wi-Fi network...");
    const { stdout } = await exec(
      `sudo nmcli device wifi connect "${selectedWifi}" password "${password}"`
    );
    console.log(stdout.toString());
    const isInternetConnected = await checkInternetConnection();
    if (isInternetConnected) {
      const ipAddress = await getIpAddress();
      console.log("Internet is connected.");
      eventEmitter.emit("stopManageWiFi", ipAddress, WebRtcPort);
      startWebRTC(ipAddress, WebRtcPort);
      resumeInternetCheck();
      openChromium();
    }
  } catch (error) {
    console.error("Error connecting to Wi-Fi network:", error);
    return res.redirect("/");
  }
}

module.exports = {
  userIndex,
  userScan,
  userConnect,
};
