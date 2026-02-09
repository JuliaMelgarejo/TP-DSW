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
import { Product } from "../product/product.entity.js";

@Entity()
export class Category extends BaseEntity{
  @Property({nullable: true})
  name!: string

  @Property({nullable: false})
  description!: string

  @OneToMany(() => Product, product => product.category, { cascade: [Cascade.ALL] })
  products = new Collection<Product>(this)
}
