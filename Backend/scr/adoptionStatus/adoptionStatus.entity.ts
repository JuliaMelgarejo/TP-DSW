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
import { AdoptionState } from "../adoptionState/adoptionState.entity.js";
import { Adoption } from "../adoption/adoption.entity.js";


@Entity()
export class AdoptionStatus extends BaseEntity{

    @Property({nullable: false})
    statusChangeDate!: Date
    
    @Property({nullable: true})
    reason?: string

    @ManyToOne(() => AdoptionState, {nullable: false})
    adoptionState!: Rel<AdoptionState>

    @ManyToOne(() => Adoption, {nullable: false})
    adoption!: Rel<Adoption>
}
