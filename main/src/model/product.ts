import { sequelize } from "../utils/db";
import { DataTypes } from "sequelize";
import User from "./user";

const Product = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      unique: true,
      type: DataTypes.STRING(255),
    },

    price: {
      type: DataTypes.FLOAT(10),
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    product_type: {
      type: DataTypes.STRING(300),
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  { timestamps: true, tableName: "product" }
);

export default Product;
