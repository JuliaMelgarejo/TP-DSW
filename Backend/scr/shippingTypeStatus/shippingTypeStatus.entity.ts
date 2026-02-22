import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Order } from "../order/order.entity.js";
import { OrderState } from "../orderState/orderstate.entity.js";
import { ShippingTypeState } from "../shippingTypeState/shippingTypeState.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
@Entity()
export class ShippingTypeStatus extends BaseEntity {
  [x: string]: any;
  
  @Property({nullable: false, unique: true})
  amount!: number
  
  @Property({ unique: true})
  enabled!: boolean
  
  @ManyToOne(() => ShippingTypeState, {nullable: false})
  shippingTypeState!: Rel<ShippingTypeState>
  
  @ManyToOne(() => Shelter, {nullable: false})
  shelter!: Rel<Shelter>

}