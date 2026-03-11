import { 
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Cascade,
  Collection,
  Rel,
  ManyToOne
} from "@mikro-orm/core";
import { BaseEntity } from "../zshare/db/baseEntity.entity.js";
import { Animal } from "../animal/animal.entity.js";
import { Person } from "../person/person.entity.js";
import { AdoptionStatus } from "../adoptionStatus/adoptionStatus.entity.js";
import { LineItemOrder } from "../line_item_order/line_item_order.entity.js";
import { OrderStatus } from "../orderStatus/orderStatus.entity.js";

@Entity()
export class Order extends BaseEntity{
  @Property()
  fecha!: Date;

  @Property()
  total!: number;

  @OneToMany(() => LineItemOrder, li => li.order, { cascade: [Cascade.ALL] })
  items = new Collection<LineItemOrder>(this);
  
  @OneToMany(() => OrderStatus, orderStatus => orderStatus.order, { cascade: [Cascade.ALL] })
  orderStatus = new Collection<OrderStatus>(this);
  
  @ManyToOne(() => Person, {nullable: true, cascade: [Cascade.ALL]})
  person!: Rel<Person>


}
