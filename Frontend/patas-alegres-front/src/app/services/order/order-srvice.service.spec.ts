import { TestBed } from '@angular/core/testing';

import { OrderSrviceService } from './order-srvice.service';

describe('OrderSrviceService', () => {
  let service: OrderSrviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSrviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
