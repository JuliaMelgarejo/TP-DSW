import { TestBed } from '@angular/core/testing';

import { SignInStateService } from './sign-in-state.service';

describe('SignInStateService', () => {
  let service: SignInStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignInStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
