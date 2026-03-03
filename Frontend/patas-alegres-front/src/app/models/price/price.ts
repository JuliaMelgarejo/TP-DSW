export class Price {
  id?: number;
  amount: number;
  startDate: Date;
  endDate?: Date;
  productId: number;

  constructor(amount: number, startDate: Date, productId: number, endDate?: Date) {
    this.amount = amount;
    this.startDate = startDate;
    this.endDate = endDate;
    this.productId = productId;
  }
}