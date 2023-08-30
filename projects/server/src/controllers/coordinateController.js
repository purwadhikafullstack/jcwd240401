const db = require("../models");
const axios = require("axios")

module.exports = {
    async coordinateToPlacename(req,res){
        const latitude = req.query.latitude
        const longitude = req.query.longitude
        try{
            if(!latitude && !longitude){
                return res.status(200).send({
                    message: "Could not get coordinates"
                })
            }
            const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(`${latitude}+${longitude}`)}&key=${process.env.KEY_OPENCAGE}&language=id`
              )
            return res.status(200).send({
                message: "Success get placename",
                data: response.data?.results[0].components
            })
        }catch(error){
            return res.status(500).send({
                message: 'Server error',
                error: error.message
            })
        }
    }
}

// coordinate to placename
// placename to coordinate
// distance calculation
// shipping cost
