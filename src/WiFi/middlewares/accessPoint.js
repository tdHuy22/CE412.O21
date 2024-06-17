const { exec: execCallback } = require("child_process");
const util = require("util");
const exec = util.promisify(execCallback);

async function turnOnAccessPoint() {
  try {
    console.log("Turning on access point...");
    const { stdout } = await exec("sudo nmcli connection up UTK_Converter");
    console.log(stdout.toString());
  } catch (err) {
    console.error("Error turning on access point:", err);
  }
}

module.exports = { turnOnAccessPoint };
