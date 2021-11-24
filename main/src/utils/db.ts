import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  database: "products",
  username: "test",
  password: "testtest",
  dialect: "mysql",
  port: 3306,
  host: "localhost",
  logging: false,
});
export { sequelize };
