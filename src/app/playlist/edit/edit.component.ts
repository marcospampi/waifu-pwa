import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Playlist, WaifuPlaylist } from '@services/playlist/playlist-header.type';
import { Episode } from '@services/playlist/playlist-item.type';
import { PlaylistService } from '@services/playlist/playlist.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  public form : FormGroup;
  public get episodes() {
    return this.form.get('episodes') as FormArray;
  }
  public get episodes_length() {
    return this.episodes.value.filter(e => e.removed == false ).length;
  }
  constructor(
    private self: ActivatedRoute,
    private playlist_service: PlaylistService,
    private fb: FormBuilder,
    private snackbar_service: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.self.paramMap.subscribe(this.handleRouter);
  }

  handleRouter = ( params: ParamMap ) => {
    if ( !params.has('uuid'))
    this.form = this.fb.group({
      uuid: [null],
      title: ['New playlist', Validators.required],
      description: [""],
      alternative_id: null,
      image: [""],
      cover: [""],
      episodes: this.fb.array([])
    })
    else {
      this.playlist_service.getPlaylist(params.get('uuid')).subscribe(
        playlist => {
          this.form = this.fb.group({
            uuid: [playlist.uuid],
            title: [playlist.title, Validators.required],
            description: [playlist.description],
            alternative_id: [playlist.alternative_id],
            image: [playlist.image],
            cover: [playlist.cover],
            episodes: this.fb.array( playlist.episodes.map(
              episode => this.fb.group({
                uuid: [episode.uuid, Validators.required],
                title: [episode.title, Validators.required],
                url: [episode.url, Validators.required],
                removed: [false]
              })
            ))
          });
        }
      )
    }
  }

  public addEpisode(event: Event) {
    let index = this.episodes_length + 1;

    this.episodes.push( this.fb.group({
      uuid: [null],
      title: [`Episode ${index}`, Validators.required],
      url: ['',Validators.required],
      removed: [false]
    }));
  }
  public removeEpisode(event: Event, index: number ) {
    if ( this.episodes.controls[index].value.uuid == null ) {
      this.episodes.removeAt(index);
    }
    else {
      this.episodes.controls[index].get('removed').setValue(true);
    }
  }

  public savePlaylist(playlist: Playlist<Episode & {removed: boolean}> = this.form.value) {
    // not new
    if ( playlist.uuid ) {
      this.playlist_service.savePlaylist(playlist).subscribe(
        success => {
          this.snackbar_service.open(`Playlist ${success.title} updated`, "dismiss",{
            duration: 2000,
            panelClass: ['mat-toolbar','mat-accent']
          });
        },
        error => {
          console.error(error);
          this.snackbar_service.open(`Error pushing updates for ${playlist.title}`,"dismiss",{
            duration: 2000,
            panelClass: ['mat-toolbar','mat-warn']
          })
        }
      )
    }
    else {
      playlist.episodes = playlist.episodes.filter( e => !e.removed );
      this.playlist_service.saveNewPlaylist(
        playlist
      ).subscribe({
        next:(data) => {
          this.form.get('uuid').setValue(data.uuid)
          this.snackbar_service.open(`Added playlist ${data.title}`,"dismiss",{
            duration: 2000,
          });
          this.router.navigate(['/','editor',data.uuid])
        },
        error: (err) => {
          console.error(err)
        }
      })
    }
  }

  public episodeTrackBy(index: number, data: Episode|FormGroup ) {
    if ( data instanceof AbstractControl ) {
      return data.value.uuid;
    }
    else {
      return data.uuid;
    }
  }
}
