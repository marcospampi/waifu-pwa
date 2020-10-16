import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Episode } from '@services/playlist/playlist-item.type';
import { RxDocument } from 'rxdb';

@Component({
  selector: 'app-pick-episode',
  templateUrl: './pick-episode.component.html',
  styleUrls: ['./pick-episode.component.scss']
})
export class PickEpisodeComponent implements OnInit {

  constructor(
    private self: MatBottomSheetRef<any,RxDocument<Episode>>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: RxDocument<Episode>[]
  ) { }

  ngOnInit(): void {
  }

  select(episode: RxDocument<Episode>) {
    this.self.dismiss(episode);
  }

}
