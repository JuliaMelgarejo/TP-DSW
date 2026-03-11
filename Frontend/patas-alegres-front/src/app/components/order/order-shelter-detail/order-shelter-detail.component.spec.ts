import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderShelterDetailComponent } from './order-shelter-detail.component';

describe('OrderShelterDetailComponent', () => {
  let component: OrderShelterDetailComponent;
  let fixture: ComponentFixture<OrderShelterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderShelterDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderShelterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
