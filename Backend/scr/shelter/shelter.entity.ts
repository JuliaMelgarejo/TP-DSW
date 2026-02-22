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
import { Zone } from "../zone/zone.entity.js";
import { Vet } from "../vet/vet.entity.js";
import { City } from "../city/city.entity.js";
import { Person } from "../person/person.entity.js";
import { Product } from "../product/product.entity.js";
import { ShippingTypeStatus } from "../shippingTypeStatus/shippingTypeStatus.entity.js";
@Entity()
export class Shelter extends BaseEntity {
  [x: string]: any;
  @Property({nullable: false, unique: true})
  name!: string
  @Property()
  phoneNumber!: string
  @Property()
  tuitionVet!: string
  @Property()
  address!: string
  @Property()
  street!: string
  @Property()
  streetNumber!: number
  @Property()
  max_capacity!: number

  @ManyToOne(() => Zone, {nullable: false})
  zone!: Rel<Zone>;

  @OneToMany(() => Rescue, rescue => rescue.shelters, { cascade: [Cascade.ALL] })
  rescues = new Collection<Rescue>(this);
  
  @OneToMany(() => Product, product => product.shelter, { cascade: [Cascade.ALL] })
  products = new Collection<Product>(this);

  @OneToMany(() => ShippingTypeStatus, shippingTypeStatus => shippingTypeStatus.shelter, { cascade: [Cascade.ALL] })
  shippingTypeStatus = new Collection<ShippingTypeStatus>(this);

  @ManyToOne(() => Vet, {  nullable: true,   cascade: [Cascade.ALL] }, )
  vet?: Rel<Vet>; 

  @ManyToOne(() => City, {nullable: false})
  city!: Rel<City>;
  
  @OneToOne(() => Person, (person) => person.shelter, { nullable: true })
  person!: Rel<Person>;
}
