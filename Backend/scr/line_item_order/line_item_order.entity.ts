import { 
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Cascade,
  Collection,
  Rel,
  ManyToOne
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Animal } from "../animal/animal.entity.js";
import { Person } from "../person/person.entity.js";
import { AdoptionStatus } from "../adoptionStatus/adoptionStatus.entity.js";
import { Order } from "../order/order.entity.js";
import { Product } from "../product/product.entity.js";

@Entity()
export class LineItemOrder extends BaseEntity{
  @Property()
  cantidad!: number;

  @Property()
  fecha!: Date;

  @Property()
  subtotal!: number;

  @ManyToOne(() => Order, { nullable: false })
  order!: Rel<Order>;

  @ManyToOne(() => Product, { nullable: false })
  product!: Rel<Product>;
}
