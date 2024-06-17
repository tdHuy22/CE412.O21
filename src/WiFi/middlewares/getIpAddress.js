const util = require("util");
const { exec: execCallback } = require("child_process");
const exec = util.promisify(execCallback);

async function getIpAddress() {
  try {
    const ip = await exec("hostname -I");
    const result = ip.stdout.toString().split(" ")[0];
    return result;
  } catch (error) {
    console.error("Error getting IP address:", error);
  }
}

module.exports = { getIpAddress };
