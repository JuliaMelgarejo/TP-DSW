import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInShelterComponent } from './sign-in-shelter.component';

describe('SignInShelterComponent', () => {
  let component: SignInShelterComponent;
  let fixture: ComponentFixture<SignInShelterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInShelterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInShelterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
