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
import { Province } from "../province/province.entity.js";
import { Product } from "../product/product.entity.js";

@Entity()
export class Price extends BaseEntity{
  @Property({nullable: false })
  date!: Date

  @Property({nullable: false})
  value!: number

  @ManyToOne(() => Product, {nullable: false, cascade: [Cascade.ALL]})
  product!: Rel<Product>


}
