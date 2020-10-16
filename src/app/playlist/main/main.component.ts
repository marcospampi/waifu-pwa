import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteRequestComponent } from '@playlist/components/delete-request/delete-request.component';
import { FileDownloadService } from '@services/file-download.service';
import { Playlist, WaifuPlaylist } from '@services/playlist/playlist-header.type';
import { PlaylistService } from '@services/playlist/playlist.service';
import { RxDocument } from 'rxdb';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public list$: Observable<Playlist[]>;
  constructor( 
    private playlist_service: PlaylistService,
    private bottom_sheet: MatBottomSheet,
    private snackbar: MatSnackBar,
    private fileDownload: FileDownloadService,
    ) {
    
  }

  ngOnInit(): void {
    this.list$ = this.playlist_service.getPlaylists();
  }

  deletePlaylist(playlist: RxDocument<Playlist>) {
    const ref = this.bottom_sheet.open<DeleteRequestComponent,RxDocument<Playlist>,boolean>
      (DeleteRequestComponent,{
      data: playlist
    });

    ref.afterDismissed().subscribe(
      result => {
        if( result ){
          this.snackbar.open(`Playlist ${playlist.title} deleted`,'dismiss',{
            duration: 2000
          });
          playlist.remove();
        }
      }
    )
  }

  exportPlaylist(__playlist: Playlist) {

    this.playlist_service.getPlaylist(__playlist.uuid).subscribe(
      _playlist => {
        const playlist: WaifuPlaylist = {
          title: _playlist.title, 
          description: _playlist.description, 
          alternative_id: _playlist.alternative_id, 
          image: _playlist.image, 
          cover: _playlist.cover, 
          episodes: _playlist.episodes.map(e => ({
            title: e.title,
            url: e.url
          })), 
        };
        let download_name = playlist.title
          .match(/[a-z0-9]+/gi)
          .map(e => e.toLocaleLowerCase())
          .join('-');
        this.fileDownload.downloadJsonFile(playlist,download_name)
      }
    )
    
    //let download_name = playlist.title
    //  .match(/[a-z0-9]+/g)
    //  .map(e => e.toLocaleLowerCase())
    //  .join('-');
    //this.fileDownload.downloadJsonFile(playlist,download_name)
  }

  async importPlaylist(event: InputEvent) {
    const target: HTMLInputElement =  event.target as any;

    if( target.files.length == 1) {
      const file = target.files.item(0);

      const text = await file.text();
      try {
        let json = JSON.parse(text);

        await this.playlist_service.saveNewPlaylist(json).toPromise();
      }
      catch(e) {
        this.snackbar.open(`Unable to import playlist`,'dismiss',{
          duration: 2000
        });
        console.error(e);
      }
    }
  }

}
