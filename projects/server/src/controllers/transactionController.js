const db = require("../models");
const axios = require("axios");
const refCode = require("referral-codes");
const { setFromFileNameToDBValuePayment } = require("../helpers/fileConverter");
const { setFromFileNameToDBValueRefund } = require("../helpers/fileConverter");
const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("../helpers/transporter");
const { join } = require("path");

module.exports = {
  async allOrdersByBranch(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate || "DESC",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      let where = {};
      const order = [];
      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        where["orderDate"] = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        where["orderDate"] = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        where["orderDate"] = {
          [db.Sequelize.Op.lt]: endDateUTC,
        };
      }
      if (pagination.search) {
        where["invoiceCode"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.status) {
        where["orderStatus"] = pagination.status;
      }
      if (pagination.date) {
        if (pagination.date.toUpperCase() === "DESC") {
          order.push(["orderDate", "DESC"]);
        } else {
          order.push(["orderDate", "ASC"]);
        }
      }

      const userId = req.user.id;
      const branchData = await db.Branch.findOne({
        where: {
          user_id: userId,
        },
      });

      if (!branchData) {
        return res.status(400).send({
          message: "Branch not found",
        });
      }

      const orders = await db.Order.findAndCountAll({
        include: [
          {
            model: db.Branch_Product,
            where: {
              branch_id: branchData.id,
            },
          },
        ],
        where,
        order,
        distinct: true,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (!orders) {
        return res.status(200).send({
          message: "No transaction found",
        });
      }
      const totalCount = orders.count;
      pagination.totalData = totalCount;

      return res.status(200).send({
        message: "Success get all transactions",
        pagination,
        data: orders,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async allOrders(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      branchId: req.query.branchId ? req.query.branchId : "",
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate || "DESC",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      let where = {};
      let whereBranchId = {};
      const order = [];
      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        where["orderDate"] = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        where["orderDate"] = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        where["orderDate"] = {
          [db.Sequelize.Op.lt]: endDateUTC,
        };
      }
      if (pagination.search) {
        where["invoiceCode"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.status) {
        where["orderStatus"] = pagination.status;
      }
      if (pagination.date) {
        if (pagination.date.toUpperCase() === "DESC") {
          order.push(["orderDate", "DESC"]);
        } else {
          order.push(["orderDate", "ASC"]);
        }
      }

      if (pagination.branchId) {
        whereBranchId["branch_id"] = pagination.branchId;
      }

      const orders = await db.Order.findAndCountAll({
        include: [
          {
            model: db.Branch_Product,
            where: whereBranchId,
          },
        ],
        where,
        order,
        distinct: true,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (!orders) {
        return res.status(200).send({
          message: "No transaction found",
        });
      }
      const totalCount = orders.count;
      pagination.totalData = totalCount;

      return res.status(200).send({
        message: "Success get all transactions",
        pagination,
        data: orders,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async orderById(req, res) {
    const orderId = req.query.orderId;
    try {
      const order = await db.Order.findOne({
        where: {
          id: orderId,
        },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
              {
                model: db.Discount,
                include: [
                  {
                    model: db.Discount_Type,
                  },
                ],
              },
            ],
          },
          {
            model: db.User,
          },
          {
            model: db.Voucher,
            include: [
              {
                model: db.Voucher_Type,
              },
            ],
          },
        ],
      });
      if (!order) {
        return res.status(400).send({
          message: "Order not found",
        });
      }

      return res.status(200).send({
        message: "Order found",
        data: order,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async changeStatus(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    const orderId = Number(req.params.id);
    try {
      const orderData = await db.Order.findOne({
        where: orderId,
        include: [
          {
            model: db.User,
          },
        ],
      });

      if (!orderData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Order not found",
        });
      }

      switch (action) {
        case "Waiting for payment":
          try {
            if (orderData.orderStatus !== "Waiting for payment confirmation") {
              await transaction.rollback();
              return res.status(400).send({
                message: "Payment has already confirmed",
              });
            }

            orderData.orderStatus = "Waiting for payment";
            await orderData.save({ transaction });
            
            const templatePath = join(
              __dirname,
              "../helpers/template/rejectedpayment.html"
            );
            const template = fs.readFileSync(
              templatePath,
              "utf-8"
            );
            const templateCompile = handlebars.compile(template);
            const rejectedPaymentEmail = templateCompile({
              name: orderData.User.name,
              invoiceCode: orderData.invoiceCode,
            });

            const nodemailerEmail = {
              from: "Groceer-e",
              to: orderData.User.email,
              subject: "Update Your Payment",
              html: rejectedPaymentEmail,
            }

            transporter.sendMail(nodemailerEmail, (error) => {
              if (error) {
                transaction.rollback();
                return res.status(500).json({ error: "Error sending email" });
              }
            });

            await transaction.commit();
            return res.status(200).send({
              message: "Order status is changed to Waiting for payment",
            });
          } catch (error) {
            await transaction.rollback();
            return res.status(500).send({
              message: "Server error",
              error: error.message,
            });
          }
        case "Processing":
          try {
            if (orderData.orderStatus === "Waiting for payment") {
              await transaction.rollback();
              return res.status(400).send({
                message:
                  "You can't process this order, payment hasn't been made",
              });
            } else if (orderData.orderStatus === "Processing") {
              await transaction.rollback();
              return res.status(400).send({
                message: "Order is already processing",
              });
            } else if (orderData.orderStatus === "Delivering") {
              await transaction.rollback();
              return res.status(400).send({
                message:
                  "You can't process this order, you are currently delivering it",
              });
            } else if (orderData.orderStatus === "Canceled") {
              await transaction.rollback();
              return res.status(400).send({
                message: "You can't process this order, it has been canceled",
              });
            }

            orderData.orderStatus = "Processing";
            await orderData.save({ transaction });

            const templatePath = join(
              __dirname,
              "../helpers/template/confirmedpayment.html"
            );
            const template = fs.readFileSync(
              templatePath,
              "utf-8"
            );
            const templateCompile = handlebars.compile(template);
            const confirmedPaymentEmail = templateCompile({
              name: orderData.User.name,
              invoiceCode: orderData.invoiceCode,
            });

            const nodemailerEmail = {
              from: "Groceer-e",
              to: orderData.User.email,
              subject: "Your Order is Being Processed",
              html: confirmedPaymentEmail,
            }
            transporter.sendMail(nodemailerEmail, (error) => {
              if (error) {
                transaction.rollback();
                return res.status(500).json({ error: "Error sending email" });
              }
            });

            await transaction.commit();
            return res.status(200).send({
              message: "Order status is changed to Processing",
            });
          } catch (error) {
            await transaction.rollback();
            return res.status(500).send({
              message: "Server error",
              error: error.message,
            });
          }
        case "Delivering":
          try {
            if (orderData.orderStatus === "Waiting for payment") {
              await transaction.rollback();
              return res.status(400).send({
                message:
                  "You can't deliver this order, payment hasn't been made",
              });
            } else if (
              orderData.orderStatus === "Waiting for payment confirmation"
            ) {
              await transaction.rollback();
              return res.status(400).send({
                message: "You can't deliver this order, confirm payment first",
              });
            } else if (orderData.orderStatus === "Delivering") {
              await transaction.rollback();
              return res.status(400).send({
                message: "You are delivering this order",
              });
            } else if (orderData.orderStatus === "Canceled") {
              await transaction.rollback();
              return res.status(400).send({
                message: "You can't deliver this order, it has been canceled",
              });
            }

            orderData.orderStatus = "Delivering";
            await orderData.save({ transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Order status is changed to Delivering",
            });
          } catch (error) {
            await transaction.rollback();
            return res.status(500).send({
              message: "Server error",
              error: error.message,
            });
          }
        default:
          await transaction.rollback();
          return res.status(400).send({
            message: "Invalid action",
          });
      }
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async cancelOrderByAdmin(req, res) {
    const orderId = Number(req.params.id);
    const { cancelReason } = req.body;
    const imgFileName = req.file ? req.file.filename : null;
    const transaction = await db.sequelize.transaction();

    try {
      const orderData = await db.Order.findOne({
        where: {
          id: orderId,
        },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
            ],
          },
          {
            model: db.User,
          },
        ],
      });

      if (!orderData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Order not found",
        });
      }

      if (orderData.orderStatus === "Delivering") {
        await transaction.rollback();
        return res.status(400).send({
          message: "You cannot cancel this order, it has been delivered",
        });
      } else if (orderData.orderStatus === "Order completed") {
        await transaction.rollback();
        return res.status(400).send({
          message: "You cannot cancel this order, it has been completed",
        });
      } else if (orderData.orderStatus === "Canceled") {
        await transaction.rollback();
        return res.status(400).send({
          message: "You cannot cancel this order, it has been canceled by user",
        });
      }

      for (const orderItem of orderData.Branch_Products) {
        const { branch_product_id, quantity } = orderItem.Order_Item;

        const branchProduct = await db.Branch_Product.findOne({
          where: { id: branch_product_id },
          transaction,
        });

        if (branchProduct) {
          const currentStockQuantity = branchProduct.quantity;

          await db.Branch_Product.increment("quantity", {
            by: quantity,
            where: { id: branch_product_id },
            transaction,
          });

          await db.Stock_History.create(
            {
              branch_product_id,
              totalQuantity: currentStockQuantity + quantity,
              quantity: orderItem.Order_Item.quantity,
              status: "canceled by admin",
            },
            { transaction }
          );
        }
      }

      if (orderData.voucher_id) {
        await db.User_Voucher.update(
          { isUsed: false },
          {
            where: {
              voucher_id: orderData.voucher_id,
              user_id: orderData.user_id,
            },
          },
          { transaction }
        );

        const voucher = await db.Voucher.findByPk(orderData.voucher_id);
        if (!voucher.isReferral) {
          await db.Voucher.increment(
            "usedLimit",
            {
              by: 1,
              where: { id: orderData.voucher_id },
            },
            { transaction }
          );
        }
      }

      if (!cancelReason || !imgFileName) {
        await transaction.rollback();
        return res.status(400).send({
          message:
            "Please input cancelation reason and refund proof to cancel this order",
        });
      }

      orderData.imgRefund = setFromFileNameToDBValueRefund(imgFileName);
      orderData.cancelReason = cancelReason;
      orderData.orderStatus = "Canceled";
      await orderData.save({ transaction });

      const templatePath = join(
        __dirname,
        "../helpers/template/canceledorder.html"
      );
      const template = fs.readFileSync(
        templatePath,
        "utf-8"
      );
      const templateCompile = handlebars.compile(template);
      const canceledOrderEmail = templateCompile({
        name: orderData.User.name,
        invoiceCode: orderData.invoiceCode,
        cancelReason: cancelReason,
      });

      const nodemailerEmail = {
        from: "Groceer-e",
        to: orderData.User.email,
        subject: "Your Order is Canceled",
        html: canceledOrderEmail,
      }
      transporter.sendMail(nodemailerEmail, (error) => {
        if (error) {
          transaction.rollback();
          return res.status(500).json({ error: "Error sending email" });
        }
      });

      await transaction.commit();
      return res.status(200).send({
        message: "Order successfully canceled",
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

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

      res.send({ message: "Product added to cart successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async removeFromCart(req, res) {
    const productId = req.params.id;

    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
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

  async deleteCartById(req, res) {
    const { id } = req.params;
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        await transaction.rollback();
        return res.status(401).send({ message: "User not found" });
      }
      await db.Cart.destroy({
        where: {
          id: id,
        },
        transaction,
      });
      await transaction.commit();
      return res.status(200).send({
        message: "Successfully delete cart item",
      });
    } catch (error) {
      await transaction.rollback();
      res
        .status(500)
        .send({ error: "Internal Server Error", error: error.message });
    }
  },

  async emptyCart(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const data = await db.Cart.destroy({
        where: { user_id: user.id },
        transaction,
      });
      if (data > 0) {
        transaction.commit();
        res.status(200).send({
          message: "cart successfully deleted",
          data,
        });
      } else {
        transaction.commit();
        res.status(200).send({
          message: "your cart is empty",
        });
      }
    } catch (error) {
      await transaction.rollback();
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

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
            where: { isRemoved: false, quantity: { [db.Sequelize.Op.gt]: 0 } },
            attributes: [
              "id",
              "product_id",
              "origin",
              "discount_id",
              "quantity",
              "branch_id",
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
                model: db.Branch,
                attributes: ["city_id"],
                include: [
                  {
                    model: db.City,
                    attributes: ["city_name"],
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

  async getUnavailableCart(req, res) {
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
            where: {
              [db.Sequelize.Op.or]: [
                { quantity: { [db.Sequelize.Op.eq]: 0 } },
                { isRemoved: true },
              ],
            },
            attributes: [
              "id",
              "product_id",
              "origin",
              "discount_id",
              "quantity",
              "branch_id",
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
                model: db.Branch,
                attributes: ["city_id"],
                include: [
                  {
                    model: db.City,
                    attributes: ["city_name"],
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

  async getCost(req, res) {
    const { origin, destination, weight, courier } = req.body;
    const body = {
      origin,
      destination,
      weight,
      courier: courier,
    };
    try {
      const response = await axios.post(
        `https://api.rajaongkir.com/starter/cost`,
        body,
        {
          headers: {
            key: `${process.env.RAJAONGKIR_API_KEY}`,
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.status(200).send({
        message: "data successfully retrieved",
        data: response.data.rajaongkir,
      });
    } catch (err) {
      return res.status(500).send({
        message: "fatal error on server",
        error: err,
      });
    }
  },

  async checkout(req, res) {
    const userId = req.user.id;
    const transaction = await db.sequelize.transaction();
    const { totalPrice, shippingMethod, shippingCost, voucher_id, cartItems } =
      req.body;
    const randomCode = refCode.generate({
      length: 5,
      count: 1,
      charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    });
    const fullDate = new Date();
    const date = fullDate.getDate();
    const month = fullDate.getMonth();
    const year = fullDate.getFullYear();
    const invoiceNumber = `INV/${date}${month}${year}/${randomCode}`;

    try {
      const user = await db.User.findByPk(userId);
      if (!user) {
        await transaction.rollback();
        return res.status(401).send({ message: "User not found" });
      }

      const address = await db.Address.findOne({
        where: {
          user_id: userId,
          isMain: true,
        },
        include: [
          {
            model: db.City,
            attributes: ["city_name", "province_id"],
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
          },
        ],
      });
      if (!address) {
        await transaction.rollback();
        return res.status(401).send({ message: "Address not found" });
      }

      const cart = await db.Cart.findAll({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
              { model: db.Discount },
            ],
          },
        ],
      });
      if (!cart) {
        await transaction.rollback();
        return res.status(401).send({
          message: "No items in the cart found",
        });
      }
      const selectedItem = cart.filter((item) => cartItems.includes(item.id));
      if (!selectedItem || selectedItem.length === 0) {
        await transaction.rollback();
        return res
          .status(401)
          .send({ message: "No items selected for checkout" });
      }

      const checkoutData = await db.Order.create(
        {
          user_id: userId,
          invoiceCode: invoiceNumber,
          orderDate: fullDate,
          orderStatus: "Waiting for payment",
          totalPrice,
          addressStreetName: address.streetName,
          addressCity: address.City.city_name,
          addressProvince: address.City.Province.province_name,
          addressLabel: address.addressLabel,
          receiver: address.receiver,
          contact: address.contact,
          postalCode: address.postalCode,
          shippingMethod,
          shippingCost,
          shippingDate: fullDate,
          voucher_id: voucher_id || null,
          createdAt: fullDate.toLocaleString("en-US", {
            timeZone: "Asia/Jakarta",
          }),
          updatedAt: fullDate.toLocaleString("en-US", {
            timeZone: "Asia/Jakarta",
          }),
        },
        { transaction: transaction }
      );

      for (const item of selectedItem) {
        let price;

        if (!item.Branch_Product?.Discount?.isExpired) {
          if (item.Branch_Product?.Discount?.discount_type_id === 1) {
            price = item.Branch_Product?.Product?.basePrice;
          } else if (item.Branch_Product?.Discount?.discount_type_id === 2) {
            const percentageAmount = item.Branch_Product.Discount.amount;
            price =
              ((item.Branch_Product.Product.basePrice *
                (100 - percentageAmount)) /
                100) *
              item.quantity;
          } else if (item.Branch_Product?.Discount?.discount_type_id === 3) {
            const nominalAmount = item.Branch_Product.Discount.amount;
            price =
              (item.Branch_Product.Product.basePrice - nominalAmount) *
              item.quantity;
          } else {
            price = item.Branch_Product.Product.basePrice * item.quantity;
          }

          const orderList = await db.Order_Item.create(
            {
              order_id: checkoutData?.id,
              branch_product_id: item.branch_product_id,
              discount_id: item.Branch_Product?.Discount?.id,
              quantity: item.quantity,
              price: price,
            },
            { transaction: transaction }
          );
        } else {
          const orderList = await db.Order_Item.create(
            {
              order_id: checkoutData?.id,
              branch_product_id: item.branch_product_id,
              discount_id: null,
              quantity: item.quantity,
              price: item.Branch_Product.Product.basePrice * item.quantity,
            },
            { transaction: transaction }
          );
        }

        await db.Stock_History.create(
          {
            branch_product_id: item.branch_product_id,
            totalQuantity: item.Branch_Product.quantity,
            quantity: item.quantity,
            status: "purchased by user",
          },
          { transaction }
        );

        await db.Branch_Product.update(
          { quantity: db.sequelize.literal(`quantity - ${item.quantity}`) },
          {
            where: {
              branch_id: item.Branch_Product.branch_id,
              id: item.branch_product_id,
            },
            transaction,
          }
        );

        await item.destroy({ transaction: transaction });
      }
      if (checkoutData.voucher_id) {
        await db.User_Voucher.update(
          { isUsed: true },
          {
            where: {
              voucher_id: checkoutData.voucher_id,
              user_id: userId,
            },
          },
          { transaction }
        );

        const voucher = await db.Voucher.findByPk(checkoutData.voucher_id);
        if (!voucher.isReferral) {
          await db.Voucher.decrement(
            "usedLimit",
            {
              by: 1,
              where: { id: checkoutData.voucher_id },
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return res.status(200).send({
        message: "New order created successfully",
        data: checkoutData,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getUserVoucher(req, res) {
    const userId = req.user.id;
    const grandTotal = req.params.grandTotal;

    try {
      const userVoucher = await db.User_Voucher.findAll({
        where: { user_id: userId, isUsed: false },
        include: [
          {
            model: db.Voucher,
            where: { isExpired: false },
            include: [
              {
                model: db.Voucher_Type,
              },
            ],
          },
        ],
      });

      if (userVoucher.length === 0) {
        return res.status(200).send({
          message: "No vouchers found",
          data: [],
        });
      }

      const vouchersWithEligibility = userVoucher.map((voucher) => ({
        ...voucher.toJSON(),
        isEligible: grandTotal >= voucher.Voucher.minTransaction,
      }));

      return res.status(200).send({
        message: "User vouchers successfully retrieved",
        data: vouchersWithEligibility,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Fatal error",
        error: error.message,
      });
    }
  },

  async userOrderById(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;
    try {
      const order = await db.Order.findOne({
        where: {
          id: orderId,
          user_id: userId,
        },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
              {
                model: db.Discount,
                include: [
                  {
                    model: db.Discount_Type,
                  },
                ],
              },
            ],
          },
          {
            model: db.User,
          },
          {
            model: db.Voucher,
            include: [
              {
                model: db.Voucher_Type,
              },
            ],
          },
        ],
      });

      if (!order) {
        return res.status(400).send({
          message: "Order not found",
        });
      }

      return res.status(200).send({
        message: "Order found",
        data: order,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async updatePayment(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;
    const imgFileName = req.file ? req.file.filename : null;
    const transaction = await db.sequelize.transaction();
    if (!imgFileName) {
      return res.status(400).send({
        message: "payment proof image file are required",
      });
    }
    try {
      const orderData = await db.Order.findOne({
        where: {
          id: orderId,
          user_id: userId,
        },
      });
      if (orderData.orderStatus !== "Waiting for payment") {
        return res.status(400).send({
          message: `you are not allowed to update your payment because the order status is ${orderData.orderStatus}`,
          orderStatus: orderData.orderStatus,
        });
      }
      await orderData.update(
        {
          imgPayment: setFromFileNameToDBValuePayment(imgFileName),
          orderStatus: "Waiting for payment confirmation",
        },
        { transaction }
      );
      await transaction.commit();
      return res
        .status(201)
        .send({ message: "Successfully upload payment proof" });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  async cancelOrder(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;
    const transaction = await db.sequelize.transaction();
    const { cancelReason } = req.body;

    try {
      const orderData = await db.Order.findOne({
        where: { id: orderId, user_id: userId },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
            ],
          },
        ],
      });

      if (!orderData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "No order data found",
        });
      }

      if (
        orderData.orderStatus === "Waiting for payment" ||
        orderData.orderStatus === "Waiting for payment confirmation"
      ) {
        await orderData.update(
          {
            orderStatus: "Canceled",
            cancelReason,
          },
          { transaction }
        );

        for (const orderItem of orderData.Branch_Products) {
          const { branch_product_id, quantity } = orderItem.Order_Item;

          const branchProduct = await db.Branch_Product.findOne({
            where: { id: branch_product_id },
            transaction,
          });

          if (branchProduct) {
            const currentStockQuantity = branchProduct.quantity;

            await db.Branch_Product.increment("quantity", {
              by: quantity,
              where: { id: branch_product_id },
              transaction,
            });

            await db.Stock_History.create(
              {
                branch_product_id,
                totalQuantity: currentStockQuantity + quantity,
                quantity: orderItem.Order_Item.quantity,
                status: "canceled by user",
              },
              { transaction }
            );
          }
        }
      } else {
        await transaction.rollback();
        return res.status(400).send({
          message: "You can't cancel this order",
        });
      }

      if (orderData.voucher_id) {
        await db.User_Voucher.update(
          { isUsed: false },
          {
            where: {
              voucher_id: orderData.voucher_id,
              user_id: orderData.user_id,
            },
          },
          { transaction }
        );

        const voucher = await db.Voucher.findByPk(orderData.voucher_id);
        if (!voucher.isReferral) {
          await db.Voucher.increment(
            "usedLimit",
            {
              by: 1,
              where: { id: orderData.voucher_id },
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return res.status(200).send({
        message: "Your order was successfully canceled",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async confirmOrder(req, res) {
    const userId = req.user.id;
    const orderId = req.params.id;
    const transaction = await db.sequelize.transaction();

    try {
      const orderData = await db.Order.findOne({
        where: { id: orderId, user_id: userId },
        include: [
          {
            model: db.Branch_Product,
            include: [
              {
                model: db.Product,
              },
              {
                model: db.Discount,
                include: [
                  {
                    model: db.Discount_Type,
                  },
                ],
              },
            ],
          },
        ],
      });
      if (!orderData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "No order data found",
        });
      }

      if (orderData.orderStatus === "Delivering") {
        await orderData.update(
          {
            orderStatus: "Order completed",
          },
          { transaction }
        );

        if (orderData.totalPrice >= 200000) {
          const vouchers = await db.Voucher.findAll({
            where: {
              branch_id: orderData.Branch_Products[0].branch_id,
              isReferral: false,
              isExpired: false,
            },
          });

          if (vouchers.length > 0) {
            const randomIndex = Math.floor(Math.random() * vouchers.length);
            const randomVoucher = vouchers[randomIndex];

            await db.User_Voucher.create({
              user_id: userId,
              voucher_id: randomVoucher.id,
              isUsed: false,
            });
          }
        }
      } else {
        await transaction.rollback();
        return res.status(400).send({
          message: "This order has not been delivered yet",
          orderStatus: orderData.orderStatus,
          tesorder: orderData,
        });
      }
      await transaction.commit();
      return res.status(200).send({
        message: "You successfully completed your order",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
