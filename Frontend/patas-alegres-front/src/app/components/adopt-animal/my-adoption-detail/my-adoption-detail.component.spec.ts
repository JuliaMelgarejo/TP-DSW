import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAdoptionDetailComponent } from './my-adoption-detail.component';

describe('MyAdoptionDetailComponent', () => {
  let component: MyAdoptionDetailComponent;
  let fixture: ComponentFixture<MyAdoptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAdoptionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAdoptionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
