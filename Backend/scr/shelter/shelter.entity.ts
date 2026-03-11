import { 
  Entity,
  Property,
  Collection,
  ManyToMany,
  ManyToOne,
  Cascade,
  Rel,
  OneToMany,
  OneToOne
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";
import { Vet } from "../vet/vet.entity.js";
import { Product } from "../product/product.entity.js";
import { ShippingTypeStatus } from "../shippingTypeStatus/shippingTypeStatus.entity.js";
import { User } from "../user/user.entity.js";
import { Address } from "../address/address.entity.js";
@Entity()
export class Shelter extends BaseEntity {
  [x: string]: any;
  @Property({nullable: false, unique: true})
  name!: string
  @Property({nullable: false})
  phoneNumber!: string
  @Property({nullable: false})
  tuitionVet!: string
  @Property({nullable: false})
  max_capacity!: number

  @OneToMany(() => Rescue, rescue => rescue.shelters, { cascade: [Cascade.ALL], nullable: true })
  rescues = new Collection<Rescue>(this);
  
  @OneToMany(() => Product, product => product.shelter, { cascade: [Cascade.ALL], nullable: true })
  products = new Collection<Product>(this);

  @OneToMany(() => ShippingTypeStatus, shippingTypeStatus => shippingTypeStatus.shelter, { cascade: [Cascade.ALL], nullable: true })
  shippingTypeStatus = new Collection<ShippingTypeStatus>(this);

  @ManyToOne(() => Vet, {  nullable: true,   cascade: [Cascade.ALL] }, )
  vet?: Rel<Vet>; 
  
  @OneToOne(() => User, (user) => user.shelter, { mappedBy: 'shelter'} )
  user!: Rel<User>;

  @OneToOne(() => Address, {
    owner: true,
    nullable: true,
    cascade: [Cascade.ALL]
  })
  address?: Rel<Address>;
}
