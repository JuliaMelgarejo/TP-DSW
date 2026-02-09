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
import { AdoptionStatus } from "../adoptionStatus/adoptionStatus.entity.js";


@Entity()
export class AdoptionState extends BaseEntity{

    @Property({nullable: false})
    type!: string
    
    @Property({nullable: true})
    description?: string

    @OneToMany(() => AdoptionStatus, (adoptionStatus) => adoptionStatus.adoptionState, {cascade: [Cascade.ALL]})
    animals = new Collection<Animal>(this)

}
