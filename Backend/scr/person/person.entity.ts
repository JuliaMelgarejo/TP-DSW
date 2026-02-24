import { 
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Cascade,
  Collection,
  OneToOne,
  ManyToOne,
  Rel,
  Enum
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { User } from "../user/user.entity.js";
import { City } from "../city/city.entity.js";
import { Adoption } from "../adoption/adoption.entity.js";
import { Order } from "../order/order.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { UserRole } from "../common/enums/user-role.enum.js";
@Entity()
export class Person extends BaseEntity {
  @Property({nullable: false})
  name!: string

  @Property({nullable: false})
  surname!: string

  @Property({nullable: false})
  doc_type!: string

  @Property({nullable: false})
  doc_nro!: string

  @Property({nullable: true})
  email!: string

  @Property({nullable: true})
  phoneNumber!: string

  @Property({nullable: false})
  birthdate!: Date

  @Property({nullable: false})
  street!: string

  @Property({nullable: true})
  nroCuit!: string

  @Property({nullable: true})
  number_street!: string

  @Enum(() => UserRole)
  role!: UserRole;

  @ManyToOne(() => City, {nullable: false, cascade: [Cascade.ALL]})
  city!: Rel<City>

  @OneToMany(() => Adoption, adoption => adoption.person, { cascade: [Cascade.ALL] })
  adoptions = new Collection<Adoption>(this)

  @OneToOne(() => User, (user) => user.person, {nullable: true})
  user?: typeof User;

  @OneToMany(() => Order, order => order.person, { cascade: [Cascade.ALL] })
  orders = new Collection<Order>(this)



}

