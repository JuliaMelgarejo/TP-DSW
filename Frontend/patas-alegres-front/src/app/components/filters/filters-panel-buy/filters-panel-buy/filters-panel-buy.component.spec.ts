import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersPanelBuyComponent } from './filters-panel-buy.component';

describe('FiltersPanelBuyComponent', () => {
  let component: FiltersPanelBuyComponent;
  let fixture: ComponentFixture<FiltersPanelBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersPanelBuyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersPanelBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
