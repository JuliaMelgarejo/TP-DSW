import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CartService {
  private KEY = 'cart';
  private items$ = new BehaviorSubject<{productId:number, qty:number}[]>(this.load());

  getItems() { return this.items$.value; }
  itemsObs() { return this.items$.asObservable(); }

  add(productId:number, qty=1) {
    const items = [...this.items$.value];
    const idx = items.findIndex(x => x.productId === productId);
    if (idx >= 0) items[idx].qty += qty;
    else items.push({ productId, qty });
    this.save(items);
  }

  remove(productId: number) {
    const items = this.items$.value.filter(i => i.productId !== productId);
    this.save(items);
  }

  clear() { this.save([]); }

  private save(items:any[]) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.items$.next(items);
  }

  private load() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  }

  setQty(productId: number, qty: number) {
  const items = [...this.items$.value];

  const idx = items.findIndex(i => i.productId === productId);
  if (idx === -1) return;

  if (qty <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].qty = qty;
  }

  this.save(items);
  }
}