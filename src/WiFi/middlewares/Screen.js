const util = require("util");
const { exec: execCallback } = require("child_process");
const exec = util.promisify(execCallback);
const { getIpAddress } = require("./getIpAddress");
require("dotenv").config();

let opened = false;

async function openChromium() {
  if (opened) return;
  opened = true;
  try {
    const ipAddress = await getIpAddress();
    const WebRtcPort = process.env.WEBPORT || 8000;
    const { stdout } = await exec(
      `chromium-browser --kiosk --enable-browser-cloud-management https://${ipAddress}:${WebRtcPort}/screen`
    );
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error opening Chromium:", error);
  }
}

async function closeChromium() {
  if (!opened) return;
  opened = false;
  try {
    const { stdout } = await exec("pkill -f chromium-browser");
    console.log(stdout.toString());
  } catch (error) {
    console.error("Error closing Chromium:", error);
  }
}

module.exports = { openChromium, closeChromium };
