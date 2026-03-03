import { 
  Entity,
  Property,
  Cascade,
  Rel,
  ManyToOne
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Product } from "../product/product.entity.js";

@Entity()
export class Price extends BaseEntity{
  @Property({ nullable: false })
  amount!: number

  @Property({ nullable: false })
  startDate!: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @ManyToOne(() => Product, { nullable: false, cascade: [Cascade.ALL] })
  product!: Rel<Product>
}
