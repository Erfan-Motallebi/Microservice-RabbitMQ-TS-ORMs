import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db";

const User = sequelize.define(
  "User",
  {
    id: {
      unique: true,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
      type: DataTypes.STRING(200),
    },
    last_name: {
      type: DataTypes.STRING(200),
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notNull: true,
      },
    },
  },
  { timestamps: true, freezeTableName: true }
);

export default User;
