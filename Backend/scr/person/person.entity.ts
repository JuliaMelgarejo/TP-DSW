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
import { Adoption } from "../adoption/adoption.entity.js";
import { Order } from "../order/order.entity.js";
import { Address } from "../address/address.entity.js";

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
  birthdate!: string

  @Property({nullable: true})
  nroCuit!: string

  @OneToMany(() => Adoption, adoption => adoption.person, { cascade: [Cascade.ALL] })
  adoptions = new Collection<Adoption>(this)

  @OneToOne(() => User, (user) => user.person, { mappedBy: 'person'})
  user!: Rel<User>;

  @OneToMany(() => Order, order => order.person, { cascade: [Cascade.ALL] })
  orders = new Collection<Order>(this)

  @OneToOne(() => Address, {
    owner: true,
    nullable: true,
    cascade: [Cascade.ALL]
  })
  address?: Rel<Address>;
}

