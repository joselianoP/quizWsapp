import { TestBed } from '@angular/core/testing';

import { AccessCounterService } from './access-counter.service';

describe('AccessCounterService', () => {
  let service: AccessCounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessCounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
