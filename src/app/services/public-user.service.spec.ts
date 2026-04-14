import { TestBed } from '@angular/core/testing';

import { PublicUserService } from './public-user.service';

describe('PublicUserService', () => {
  let service: PublicUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
