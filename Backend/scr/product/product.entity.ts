import { Entity, ManyToOne, Property, Cascade, Rel, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Photo } from "../photo/photo.entity.js";
import { LineItemOrder } from "../line_item_order/line_item_order.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Price } from "../price/price.entity.js";
import { Category } from "../productCategory/productCategory.entity.js";
@Entity()
export class Product extends BaseEntity {
  [x: string]: any;

  @Property({ nullable: false })
  name!: string

  @Property({ nullable: true }) 
  description!: string

  @Property({ nullable: false })
  stock!: number

  @Property({ nullable: true })
  crossed_out_price!: number

  @OneToMany(() => LineItemOrder, lineItemOrder => lineItemOrder.product, { nullable: true, orphanRemoval: true })
  lineItemOrders = new Collection<LineItemOrder>(this);

  @OneToMany(() => Price, price => price.product, { nullable: false, orphanRemoval: true })
  prices = new Collection<Price>(this);
  
  @ManyToOne(() => Category, { nullable: false })
  category!: Rel<Category>

  @ManyToOne(() => Shelter, { nullable: false })
  shelter!: Rel<Shelter>

  @OneToMany(() => Photo, photo => photo.product, { nullable: true, orphanRemoval: true })
  photos = new Collection<Photo>(this);
}
