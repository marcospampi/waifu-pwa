import { TestBed } from '@angular/core/testing';

import { MediaBroadcasterService } from './media-broadcaster.service';

describe('MediaBroadcasterService', () => {
  let service: MediaBroadcasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaBroadcasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
