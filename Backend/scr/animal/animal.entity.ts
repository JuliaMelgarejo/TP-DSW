import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Breed } from "../breed/breed.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";
import { User} from "../user/user.entity.js";
import { Photo } from "../photo/photo.entity.js";
import { Adoption } from "../adoption/adoption.entity.js";
@Entity()
export class Animal extends BaseEntity {
  [x: string]: any;

  @Property({nullable: false, unique: true})
  name!: string

  @Property()
  birth_date!: Date

  @Property() 
  description!: string

  @ManyToOne(() => Breed, {nullable: false})
  breed!: Rel<Breed>;

  @ManyToOne(() => Rescue, {nullable: false})
  rescueClass!: Rel<Rescue>

  @ManyToMany(()=> User)
  user!: Rel<User>

  @OneToMany(() => Photo, photo => photo.animal, {orphanRemoval: true,})
  photos = new Collection<Photo>(this);

  @OneToMany(() => Adoption, adoption => adoption.animal, {orphanRemoval: true,})
  adoptions = new Collection<Adoption>(this);

}
