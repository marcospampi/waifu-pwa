import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Episode } from '@services/playlist/playlist-item.type';
import { RxDocument } from 'rxdb';

export type PickEpisodeData = {
  episodes: RxDocument<Episode>[];
  current: number;
}
@Component({
  selector: 'app-pick-episode',
  templateUrl: './pick-episode.component.html',
  styleUrls: ['./pick-episode.component.scss']
})
export class PickEpisodeComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollViewport', {static: true}) viewport:  CdkVirtualScrollViewport;
  constructor(
    private self: MatBottomSheetRef<any,RxDocument<Episode>>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: PickEpisodeData
  ) { }

  ngAfterViewInit(): void {
    // YES, THIS HACK
    setTimeout( 
      () => this.viewport.scrollToIndex(this.data.current), 
    100);
  }

  ngOnInit(): void {
    //
     
  }

  select(episode: RxDocument<Episode>) {
    this.self.dismiss(episode);
  }

}
