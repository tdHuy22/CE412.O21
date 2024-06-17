require("dotenv").config();

const loadIndex = async (req, res) => {
  try {
    const ip = req.hostname;
    res.render("index", {
      hostname: ip,
      port: process.env.PORT || 8000,
    });
  } catch (err) {
    console.error(err);
  }
};

const loadScreen = async (req, res) => {
  try {
    const ip = req.hostname;
    res.render("screen", {
      hostname: ip,
      port: process.env.PORT || 8000,
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  loadIndex,
  loadScreen,
};
