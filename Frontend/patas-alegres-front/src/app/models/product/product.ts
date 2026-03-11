import { Category } from "../category/category.js";
import { Price } from "../price/price.js";

export class Product {
  id?: number;
  name: string;
  description?: string;
  stock: number;
  crossed_out_price?: number;
  lineItemsOrders?: any[];
  prices: Price[] = [];
  category!: Category;
  categoryId?: number;
  shelter: number;
  photos?: any[];

  constructor(
    name: string, 
    stock: number, 
    prices: Price[], 
    category: Category,
    categoryId: number,
    shelter: number, 
    description?: string, 
    crossed_out_price?: number, 
    lineItemsOrders?: any[], 
    photos?: any[],
    updatedAt?: Date,
    createdAt?: Date,
  ) 
  {
    this.name = name;
    this.stock = stock;
    this.prices = prices;
    this.category = category;
    this.categoryId = categoryId;
    this.shelter = shelter;
    this.description = description;
    this.crossed_out_price = crossed_out_price;
    this.lineItemsOrders = lineItemsOrders;
    this.photos = photos;
  }
}