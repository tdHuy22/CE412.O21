const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);

async function checkInternetConnection() {
  try {
    const { stdout } = await exec("ping -c 1 8.8.8.8");
    console.log(stdout.toString());
    return true;
  } catch (error) {
    return false;
  }
}

async function scanForWiFiNetworks() {
  try {
    const { stdout, stderr } = await exec(
      "sudo nmcli --terse --fields ssid device wifi list"
    );
    const networks = stdout.split("\n");
    const result = networks.filter((network) => network !== "");
    return result;
  } catch (error) {
    console.error("Error scanning for Wi-Fi networks:", error);
    return [];
  }
}

// Replace the export statement with the new functions
module.exports = {
  checkInternetConnection,
  scanForWiFiNetworks,
};
