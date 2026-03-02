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
import { Product } from "../product/product.entity.js";

@Entity()
export class Category extends BaseEntity{
  @Property({nullable: false})
  name!: string

  @Property({nullable: true})
  description!: string

  @OneToMany(() => Product, product => product.category, { cascade: [Cascade.ALL] })
  products = new Collection<Product>(this)
}
