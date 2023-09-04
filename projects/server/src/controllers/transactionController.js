const db = require("../models");

module.exports = {
  // admin

  // admin get all order
  // admin change order status
  // admin cancel order

  // user

  // user add to cart
  async addToCart(req, res) {
    const productId = req.params.id;
    const quantity = Number(req.body.quantity);

    try {
      if (quantity === 0) {
        return res.status(400).send({ message: "Quantity invalid" });
      }

      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }

      // Check if the product exists
      const product = await db.Branch_Product.findByPk(productId);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      if (quantity > product.quantity) {
        return res
          .status(400)
          .send({ message: "Quantity exceeds available stock" });
      }

      await user.addBranch_Product(product, { through: { quantity } });

      // Add the product to the user's cart
      //   const isExistCart = await db.Cart.findOne({
      //     where: { branch_product_id: req.params.id, user_id: req.user.id },
      //   });
      //   if (isExistCart) {
      //     isExistCart.quantity = isExistCart.quantity + quantity;
      //     await isExistCart.save();
      //   } else {
      //     await db.Cart.create({
      //       user_id: req.user.id,
      //       branch_product_id: req.params.id,
      //       quantity: quantity,
      //     });
      //   }

      res.send({ message: "Product added to cart successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  // user remove from cart
  async removeFromCart(req, res) {
    const productId = req.params.id;

    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      // Check if the product exists
      const product = await db.Branch_Product.findByPk(productId);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      await user.removeBranch_Product(product);
      res.send({ message: "Product removed from cart successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  //delete cart
  async deleteCart(req, res) {
    const { cartList } = req.body;
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        await transaction.rollback();
        return res.status(401).send({ message: "User not found" });
      }
      if (!cartList) {
        await transaction.rollback();
        return res.status(400).send({ message: "carts not found" });
      } else {
        for (const item of cartList) {
          await db.Cart.destroy({
            where: {
              id: item,
            },
            transaction,
          });
        }
        await transaction.commit();
        return res.status(200).send({
          message: "cart successfully deleted",
        });
      }
    } catch (error) {
      await transaction.rollback();
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
  // user get all cart
  async getCart(req, res) {
    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }

      const cart = await db.Cart.findAll({
        where: { user_id: user.id },
        attributes: ["id", "branch_product_id", "quantity"],
        include: [
          {
            model: db.Branch_Product,
            attributes: [
              "id",
              "product_id",
              "origin",
              "discount_id",
              "quantity",
            ],
            include: [
              {
                model: db.Discount,
                attributes: ["discount_type_id", "amount", "isExpired"],
                include: [
                  {
                    model: db.Discount_Type,
                    attributes: ["type"],
                  },
                ],
              },
              {
                model: db.Product,
                attributes: [
                  "name",
                  "description",
                  "weight",
                  "unitOfMeasurement",
                  "basePrice",
                  "imgProduct",
                  "storageInstruction",
                  "storagePeriod",
                  "category_id",
                ],
                include: [
                  {
                    model: db.Category,
                    attributes: ["name"],
                  },
                ],
              },
            ],
          },
        ],
      });

      //   const cartDetails = cart.map((cartItem) => ({
      //     product: {
      //       id: cartItem.Product.id,
      //       name: cartItem.Product.name,
      //       price: cartItem.Product.price,
      //       description: cartItem.Product.description,
      //       imgProduct: cartItem.Product.imgProduct,
      //       stock: cartItem.Product.stock,
      //       isActive: cartItem.Product.isActive,
      //       createdAt: cartItem.Product.createdAt,
      //       updatedAt: cartItem.Product.updatedAt,
      //       category: {
      //         id: cartItem.Product.Category.id,
      //         name: cartItem.Product.Category.name,
      //       },
      //     },
      //     quantity: cartItem.quantity,
      //   }));

      res.status(201).send({
        message: "Cart retrieved successfully",
        data: cart,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  // user checkout
  // user payment
  // user cancel order
  // user confirm order
};
