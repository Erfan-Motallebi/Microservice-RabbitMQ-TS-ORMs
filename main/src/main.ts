import express, { Express, Request, Response } from "express";
import { sequelize } from "./utils/db";
import Product from "./model/product";
import User from "./model/user";
import amqp, { Message } from "amqplib/callback_api";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = (process.env.PORT || 5001) as number;

const HOSTNAME = (process.env.HOSTNAME || "localhost") as string;

const startApp = async () => {
  try {
    await sequelize.authenticate();
    app.listen(PORT, HOSTNAME, function () {
      console.log(
        `🚀 Server Main is up and running at https://${HOSTNAME}:${PORT}`
      );
    });

    // ! Database Synchronization
    await User.sync();
    await Product.sync();

    console.log("🚀 Successfully connected to Database [ Sequelize ORM ] ");

    amqp.connect("amqp://localhost:5672", (err0: any, connection) => {
      try {
        if (err0) {
          throw err0;
        }
        console.log("🚀 Successfully connected to Event-bus based on Docker ");
        connection.createChannel((err1: any, channel) => {
          if (err1) {
            throw err1;
          }

          // ! Application Channels Section
          channel.assertQueue("product_created", { durable: false });

          // ! Appliaction Consumption Section
          channel.consume(
            "product_created",
            async (msg: Message | null): Promise<void> => {
              console.log("Message received: %s", msg?.content.toString());
              try {
                const newUser = await User.create({
                  first_name: "Erika",
                  last_name: "Motallebi",
                  email: "eZipcoder@gmail.com",
                });

                const newProduct = await Product.create(
                  JSON.parse(msg?.content.toString() as string)
                );
                newProduct.setDataValue("user_id", newUser.getDataValue("id"));
                await newProduct.save();
              } catch (error) {
                console.error({ message: error });
              }
              channel.ack(msg as Message);
            }
          );

          //  ? test Channel consusme
          channel.consume("test_queue", (msg) => {
            setTimeout(() => {
              console.log("Consumer 1 : %s", msg?.content.toString());
            }, 2000);
            channel.ack(msg as Message);
          });
          channel.consume(
            "test_queue",
            (msg) => {
              setTimeout(() => {
                console.log("Consumer 2: %s", msg?.content.toString());
              }, 2000);
              channel.ack(msg as Message);
            }
            // { noAck: false }
          );
          channel.consume(
            "test_queue",
            (msg) => {
              setTimeout(() => {
                console.log("Consumer 3: %s", msg?.content.toString());
              }, 2000);
              channel.ack(msg as Message);
            }
            // { noAck: false }
          );
          console.log("_______________________________________________");
          // ! Whole Application
          app.get("/api/products", async (req: Request, res: Response) => {
            const products = await Product.findAll({});
            res.status(200).json({ allProdoct: products });
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            console.log(req.body);
            const newProduct = await Product.create(req.body);
            res.status(201).json({ product: newProduct });
          });

          app.post(
            "/api/products/:productId",
            async (req: Request, res: Response) => {
              const { productId } = req.params;
              const product = await Product.findByPk(productId);
              if (!product?.get()) {
                return res.status(404).json({ product: "Not Found !" });
              }
              res.status(200).json({ product: product.get() });
            }
          );
          app.delete(
            "/api/products/:productId",
            async (req: Request, res: Response) => {
              const { productId } = req.params;

              const deletedProduct = await Product.destroy({
                where: { id: productId },
              });
              console.log(deletedProduct);
              if (deletedProduct > 0) {
                return res.send({ deleted: 1, success: true });
              }
              return res.send({ deleted: 0, success: false });
            }
          );

          // ! User Routes
          app.post("/api/users", async (req: Request, res: Response) => {
            const newUser = await User.create(req.body);
            res.status(201).json({ user: newUser });
          });

          // res.status(201).json({ product: newProduct });
        });
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await startApp();
})();
