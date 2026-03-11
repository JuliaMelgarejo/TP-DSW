import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterPublicDetailComponent } from './shelter-public-detail.component';

describe('ShelterPublicDetailComponent', () => {
  let component: ShelterPublicDetailComponent;
  let fixture: ComponentFixture<ShelterPublicDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterPublicDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterPublicDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
