import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Order } from "../order/order.entity.js";
import { OrderState } from "../orderState/orderstate.entity.js";
@Entity()
export class OrderStatus extends BaseEntity {
  [x: string]: any;
  
  @Property({nullable: false})
  statusChangeDate!: Date
  
  @Property({ unique: true})
  motive?: string
  
  @ManyToOne(() => OrderState, {nullable: false})
  orderState!: Rel<OrderState>
  
  @ManyToOne(() => Order, {nullable: false})
  order!: Rel<Order>

}