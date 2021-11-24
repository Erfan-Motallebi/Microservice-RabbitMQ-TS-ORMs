import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from "typeorm";

// import { Product } from "./product.ts";

export interface IUser {
  _id: ObjectID;
  first_name: string;
  last_name: string;
  email: string;
  // products: Product[];
  created_at: Date;
  updated_at: Date;
}

@Entity({ database: "user" })
export class User implements IUser {
  @ObjectIdColumn()
  _id!: ObjectID;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  email!: string;

  // @OneToMany(() => Product, (product) => product.user)
  // products!: Product[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
