import { Entity, ManyToOne, PrimaryKey, Property, Cascade, Rel, ManyToMany } from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Animal } from "../animal/animal.entity.js";
import { Product } from "../product/product.entity.js";

@Entity()
export class Photo extends BaseEntity {
  [x: string]: any;

  @Property()
  url!: string; // /uploads/animals/1/foto.jpg

  @Property({ nullable: true })
  originalName?: string;

  @Property({ nullable: true })
  mimeType?: string;

  @Property({ nullable: true })
  size?: number;

  @ManyToOne(() => Animal)
  animal!: Rel<Animal>;

  @ManyToOne(() => Product)
  product!: Rel<Product>;

}
