import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalPublicComponent } from './animal-public.component';

describe('AnimalPublicComponent', () => {
  let component: AnimalPublicComponent;
  let fixture: ComponentFixture<AnimalPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
