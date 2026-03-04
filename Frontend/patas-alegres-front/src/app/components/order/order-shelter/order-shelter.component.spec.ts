import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderShelterComponent } from './order-shelter.component';

describe('OrderShelterComponent', () => {
  let component: OrderShelterComponent;
  let fixture: ComponentFixture<OrderShelterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderShelterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderShelterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
