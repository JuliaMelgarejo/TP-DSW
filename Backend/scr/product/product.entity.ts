import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Breed } from "../breed/breed.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";
import { User} from "../user/user.entity.js";
import { Photo } from "../photo/photo.entity.js";
import { Adoption } from "../adoption/adoption.entity.js";
import { LineItemOrder } from "../line_item_order/line_item_order.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Price } from "../price/price.entity.js";
import { Category } from "../productCategory/productCategory.entity.js";
@Entity()
export class Product extends BaseEntity {
  [x: string]: any;

  @Property({nullable: false, unique: true})
  name!: string

  @Property() 
  description!: string

  @Property()
  stock!: number

  @Property()
  deeleted_price!: number

  @OneToMany(() => LineItemOrder, lineItemOrder => lineItemOrder.product, {orphanRemoval: true,})
  lineItemOrders = new Collection<LineItemOrder>(this);

  @OneToMany(() => Price, price => price.product, {orphanRemoval: true,})
  prices = new Collection<Price>(this);
  
  @ManyToOne(() => Category, {nullable: false, cascade: [Cascade.ALL]})
  category!: Rel<Category>

  @ManyToOne(() => Shelter, {nullable: true, cascade: [Cascade.ALL]})
  shelter!: Rel<Shelter>

  @OneToMany(() => Photo, photo => photo.product, { orphanRemoval: true })
  photos = new Collection<Photo>(this);
}
