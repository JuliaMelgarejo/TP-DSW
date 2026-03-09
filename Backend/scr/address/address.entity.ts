import{ Entity, Property, OneToOne, Rel, Collection, OneToMany } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";

@Entity()
export class Address extends BaseEntity {
  @Property({nullable: false, type: 'decimal', precision: 10, scale: 8})
  latitude!: number

  @Property({nullable: false, type: 'decimal', precision: 11, scale: 8})
  longitude!: number

  @Property({nullable: true})
  formattedAddress!: string

  @Property({nullable: true})
  placeId!: string

  @Property({nullable: true})
  street!: string

  @Property({nullable: true})
  streetNumber!: string

  @Property({nullable: true})
  city!: string

  @Property({nullable: true})
  postalCode!: string

  @Property({nullable: true})
  province!: string

  @Property({nullable: true})
  country!: string

  @OneToMany(() => Rescue, rescue => rescue.address)
  rescues = new Collection<Rescue>(this);

}