import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterAdoptionDetailComponent } from './shelter-adoption-detail.component';

describe('ShelterAdoptionDetailComponent', () => {
  let component: ShelterAdoptionDetailComponent;
  let fixture: ComponentFixture<ShelterAdoptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterAdoptionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterAdoptionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
