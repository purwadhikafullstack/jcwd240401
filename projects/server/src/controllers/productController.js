const db = require("../models");
const {
  setFromFileNameToDBValueCategory,
  getAbsolutePathPublicFileCategory,
  getFileNameFromDbValue,
} = require("../helpers/fileConverter");

module.exports = {
  async createCategory(req, res) {
    // const user_id = req.user.id;
    try {
      const { name } = req.body;
      let imgCategory = "";

      if (!req.file) {
        return res.status(400).send({
          message: "Missing category image file",
        });
      }

      if (req.file) {
        imgCategory = setFromFileNameToDBValueCategory(req.file.filename);
      }

      await db.Category.create({
        name,
        imgCategory,
      });

      return res
        .status(201)
        .send({ message: "Successfully created new category" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
};
// create category
// modify category name
// modify category image
// get all category
// get branch category

// create product
// modify name
// modify description
// modify category
// modify storage instruction
// modify storage period
// modify base price
// modify weight
// modify unit of measurement
// modify img product
// remove product (makesure branch not using it)
// get product
// get product per id
