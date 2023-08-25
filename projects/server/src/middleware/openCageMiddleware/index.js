const axios = require("axios");
module.exports = {
  async addressUserCoordinate(req, res, next) {
    try {
      const { streetName, city, province } = req.body;
      if (!streetName && !city && !province) {
        return next();
      }
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          `${streetName}, ${city}, ${province}`
        )}&key=${process.env.KEY_OPENCAGE}`
      );
      const location = response.data?.results[0]?.geometry;
      req.geometry = location;

      next();
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching coordinates",
        errors: error.message,
      });
    }
  },
};
