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
import { Person } from "../person/person.entity.js";
import { Province } from "../province/province.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";

@Entity()
export class City extends BaseEntity{
  @Property({nullable: true})
  name!: string

  @Property({nullable: false})
  zip_code!: number

  @ManyToOne(() => Province, {nullable: false})
  province!: Rel<Province>;

  @OneToMany(() => Rescue, rescue => rescue.city, { cascade: [Cascade.ALL] })
  rescues = new Collection<Rescue>(this)
}
