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

@Entity()
export class Adoption extends BaseEntity{
  @Property({nullable: true})
  comments?: string

  @Property({nullable: false})
  adoption_date!: Date

  @ManyToOne(() => Animal, {nullable: false})
  animal!: Rel<Animal>;

  @ManyToOne(() => Person, {nullable: false})
  person!: Rel<Person>;

  @OneToMany(() => AdoptionStatus, adoptionStatus => adoptionStatus.adoption, { cascade: [Cascade.ALL] })
  adoptions = new Collection<Adoption>(this)
}
