import { 
  Entity,
  Property,
  OneToOne,
  Rel,
  Enum
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Person } from "../person/person.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { UserRole } from "../common/enums/user-role.enum.js";
@Entity()
export class User extends BaseEntity {
  @Property({nullable: false, unique:true })
  username!: string

  @Property({nullable: false})
  password!: string

  @Enum(() => UserRole)
  role!: UserRole;

 @OneToOne(() => Person, (person) => person.user, {owner: true, nullable: true})
  person?: Rel<Person>;

  @OneToOne(() => Shelter,(shelter) => shelter.user, { owner: true, nullable: true })
  shelter?: Rel<Shelter>;

}