import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickEpisodeComponent } from './pick-episode.component';

describe('PickEpisodeComponent', () => {
  let component: PickEpisodeComponent;
  let fixture: ComponentFixture<PickEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
