import "reflect-metadata";
import express, { Express, Request, Response } from "express";
import { createConnection } from "typeorm";
import cors from "cors";
import { Product } from "./entity/product";
import { IUser, User } from "./entity/user";
import ampq from "amqplib/callback_api";

createConnection()
  .then((db) => {
    // ! Db Connection
    const productRepository = db.getMongoRepository(Product);
    const userRepository = db.getMongoRepository(User);

    ampq.connect("amqp://localhost:5672/", (err0: any, connection) => {
      try {
        if (err0) {
          throw err0;
        }
        console.log("🚀 Connected to the Event-Broker");
        connection.createChannel((err1: any, channel) => {
          if (err1) {
            throw err1;
          }
          // ! Channel Created
          channel.assertExchange("main", "direct");
          channel.assertQueue("product_created", { durable: false });
          channel.assertQueue("test_queue", { durable: false });
          channel.bindQueue("product_created", "main", "myProduct");
          channel.bindQueue("test_queue", "main", "myQueue");
          // ! Whole Application

          // ! Constant Variables
          const PORT = (process.env.PORT || 5000) as number;
          const HOSTNAME = (process.env.HOSTNAME || "localhost") as string;
          // ! Express App
          const app: Express = express();
          app.use(express.json());
          app.use(express.urlencoded({ extended: false }));
          app.use(cors({ origin: "http://localhost:5000" }));
          // ! Product Routes
          app.get("/api/products", async (req: Request, res: Response) => {
            const allProducts = await productRepository.find({});

            res.status(200).json({ Products: allProducts });
          });

          app.post("/api/products", async (req: Request, res: Response) => {
            const newProduct = productRepository.create(req.body);
            // Channeling to Main.ts
            channel.sendToQueue(
              "product_created",
              Buffer.from(JSON.stringify(newProduct))
            );
            await productRepository.save(newProduct);
            res.status(201).json({ product: newProduct });
          });

          app.post(
            "/api/products/:name",
            async (req: Request, res: Response) => {
              const { name } = req.params;
              const product = await productRepository.find({
                where: {
                  name: { $eq: name },
                },
              });
              if (product.length == 0) {
                return res
                  .status(404)
                  .json({ error: [{ message: "Product not found" }] });
              }
              res.status(200).json({ product });
            }
          );

          app.put(
            "/api/products/:name",
            async (req: Request, res: Response) => {
              const { name } = req.params;
              const updatedProduct = await productRepository.update(
                { name },
                req.body
              );
              res.status(201).json([updatedProduct]);
            }
          );

          // ! User Routes
          app.post("/api/users", async (req: Request, res: Response) => {
            const newUser = userRepository.create(req.body) as IUser[];
            try {
              await userRepository.save(newUser);
            } catch (error) {
              console.error(error);
            }
            res.status(201).json({ user: newUser });
          });

          app.post("/api/users/:email", async (req: Request, res: Response) => {
            const { email } = req.params;
            const specificUser = await userRepository.findOne({
              where: {
                email,
              },
            });
            res.status(200).json({ user: specificUser });
          });

          // ! Test Queue Routes
          app.get("/api/queue", async (req: Request, res: Response) => {
            let numbers1 = ["1 Popup", 2, 3, 4, "5 Endup"];
            let numbers2 = ["6 Popup", 7, 8, 9, "10 Endup"];
            numbers1.forEach((number) => {
              return channel.sendToQueue(
                "test_queue",
                Buffer.from(JSON.stringify(number))
              );
            });
            // numbers2.forEach((number) => {
            //   return channel.sendToQueue(
            //     "test_queue",
            //     Buffer.from(JSON.stringify(number))
            //   );
            // });
            res.send({ Queue: "Sent", success: true });
          });

          app.listen(PORT, HOSTNAME, () => {
            console.log(
              `🚀 You are connected to the server on http://${HOSTNAME}:${PORT}`
            );
          });

          //  ? amqp connection closed
          process.on("beforeExit", () => {
            connection.close();
          });
        });
      } catch (error) {
        //  console.error.bind(this, error);
        console.error(error);
      }
    });
  })
  .catch((err) => console.error(err));
