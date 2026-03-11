import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { ShippingTypeStatus } from "../shippingTypeStatus/shippingTypeStatus.entity.js";

@Entity()
export class ShippingTypeState extends BaseEntity {
  [x: string]: any;

  @Property({nullable: false, unique: true})
  name!: string

  @OneToMany(() => ShippingTypeStatus, shippingTypeStatus => shippingTypeStatus.shippingTypeState, {cascade: [Cascade.ALL]})
  shippingTypeStatus = new Collection<ShippingTypeStatus>(this)

}
