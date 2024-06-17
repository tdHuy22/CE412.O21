const { Router } = require("express");
const webRTCRouteRoute = Router();
const { loadIndex, loadScreen } = require("../middlewares/rtcRouteController");

webRTCRouteRoute.get("/", loadIndex);
webRTCRouteRoute.get("/screen", loadScreen);

module.exports = webRTCRouteRoute;
