import { Component, OnInit } from '@angular/core';
import { PlaylistService } from './services/playlist/playlist.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  constructor(
    private playlist_service: PlaylistService,
  ){}
  ngOnInit(): void {

  }
}
