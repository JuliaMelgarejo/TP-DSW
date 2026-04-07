import { TestBed } from '@angular/core/testing';

import { AdoptionService } from './adoption.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

fdescribe('AdoptionService', () => {
  let service: AdoptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          AdoptionService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });
    service = TestBed.inject(AdoptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create an adoption for an animal', () => {
    const animalId = 1;

    const mockResponse = {
      message: 'Adoption created',
      data: { id: 1 }
    };

    service.createForAnimal(animalId, 'Quiero adoptarlo')
      .subscribe(res => {
        expect(res.message).toBe('Adoption created');
      });

    const req = httpMock.expectOne(
      `http://localhost:3000/api/animal/${animalId}/adoptions`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ comments: 'Quiero adoptarlo' });

    req.flush(mockResponse);
  });
});
