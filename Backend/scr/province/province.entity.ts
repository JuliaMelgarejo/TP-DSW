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
import { Country } from "../country/country.entity.js";
import { City } from "../city/city.entity.js";
@Entity()
export class Province extends BaseEntity{
  @Property({nullable: true})
  name!: string

  @ManyToOne(() => Country, {nullable: false})
  country!: Rel<Country>;
  
  @OneToMany(() => City, city => city.province, { cascade: [Cascade.ALL] })
  cities = new Collection<City>(this)
}
