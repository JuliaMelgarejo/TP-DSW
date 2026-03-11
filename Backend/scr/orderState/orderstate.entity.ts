import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { OrderStatus } from "../orderStatus/orderStatus.entity.js";

@Entity()
export class OrderState extends BaseEntity {
  [x: string]: any;

  @Property({nullable: false, unique: true})
  type!: string

  @Property({nullable: true})
  description?: string

  @OneToMany(() => OrderStatus, orderStatus => orderStatus.orderState, {cascade: [Cascade.ALL]})
  orderStatus = new Collection<OrderStatus>(this)

}
