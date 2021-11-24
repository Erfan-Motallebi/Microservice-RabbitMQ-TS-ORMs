import {
  Entity,
  ObjectIdColumn,
  Column,
  ObjectID,
  UpdateDateColumn,
  CreateDateColumn,
  BaseEntity,
  Unique,
} from "typeorm";
// import { User } from "./user";

export enum ProductTypeEnum {
  ANY = "any",
  UTENSILS = "utensils",
  ELECTRICAL_DEVICES = "electrical_devices",
  MODBILE_APPS = "mobile_apps",
  VEHICLES = "vehicles",
}

interface IProductColumns {
  _id: ObjectID;
  name: string;
  price: number;
  quantity: number;
  product_type: ProductTypeEnum;
  // user: User;
  created_at: Date;
  updated_at: Date;
}
@Entity()
export class Product extends BaseEntity implements IProductColumns {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column({
    unique: true,
    length: 20,
  })
  name!: string;

  @Column({
    type: "numeric",
  })
  price!: number;

  @Column({ nullable: true })
  quantity!: number;

  @Column({
    type: "enum",
    enum: ProductTypeEnum,
    default: ProductTypeEnum.ANY,
  })
  product_type!: ProductTypeEnum;

  // @ManyToOne(() => User, (user) => user.products)
  // user!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
