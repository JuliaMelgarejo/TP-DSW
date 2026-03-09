import { 
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Cascade,
  Collection
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";

@Entity()
export class Zone extends BaseEntity{
  @Property({nullable: false})
  name!: string
}
