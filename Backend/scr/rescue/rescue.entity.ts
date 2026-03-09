import { Entity, OneToMany, Property, Collection, Cascade, ManyToMany, ManyToOne, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Animal } from "../animal/animal.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Address } from "../address/address.entity.js";

@Entity()
export class Rescue extends BaseEntity {
  @Property({ nullable: false })
  rescue_date!: Date;

  @Property()
  description!: string;

  @Property()
  comments!: string;

  @OneToMany(() => Animal, animal => animal.rescueClass, { cascade: [Cascade.ALL] })
  animals = new Collection<Animal>(this);

  @ManyToOne(() => Shelter, {nullable: false})
  shelters!: Rel<Shelter>;

  @ManyToOne(() => Address, { nullable: false })
  address!: Rel<Address>;

}
