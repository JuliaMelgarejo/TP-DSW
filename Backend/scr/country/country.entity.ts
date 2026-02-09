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

@Entity()
export class Country extends BaseEntity{
  @Property({nullable: true})
  name!: string

  @OneToMany(() => Province, province => province.country, { cascade: [Cascade.ALL] })
   provinces = new Collection<Province>(this)
}
