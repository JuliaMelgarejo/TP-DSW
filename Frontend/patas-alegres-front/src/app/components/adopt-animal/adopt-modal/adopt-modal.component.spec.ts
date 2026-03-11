import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptModalComponent } from './adopt-modal.component';

describe('AdoptModalComponent', () => {
  let component: AdoptModalComponent;
  let fixture: ComponentFixture<AdoptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdoptModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdoptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
