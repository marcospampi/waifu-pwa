import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSliderChange } from '@angular/material/slider';
import { ActivatedRoute, ParamMap, Routes } from '@angular/router';
import { Playlist } from '@services/playlist/playlist-header.type';
import { Episode } from '@services/playlist/playlist-item.type';
import { PlaylistService } from '@services/playlist/playlist.service';
import { PickEpisodeComponent, PickEpisodeData } from '@video-player/components/pick-episode/pick-episode.component';
import { pid } from 'process';
import { RxDocument } from 'rxdb';
import { fromEvent, Observable ,merge, from, of, Subscription, Subject, forkJoin} from 'rxjs';
import {debounceTime, filter, map, mapTo, share, take, tap, throttleTime} from 'rxjs/operators'


@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  animations: [
    trigger('fadeControls', [
      state('true', style({
        'display': 'block'
      })),
      state('false', style({
        'display': 'none'
      })),
      transition('true=>false', animate('500ms',keyframes([
        style({offset:0, opacity: 1, display: 'block'}),
        style({offset:0.999, opacity: 0, display: 'block'}),
        style({offset:1, opacity: 0, display: 'none'})
      ]))),
      transition('false=>true', animate('250ms',keyframes([
        style({offset:0, opacity: 0, display: 'block'}),
        style({offset:0.001, opacity: 0, display: 'block'}),
        style({offset:1, opacity: 1, display: 'block'})
      ])))
    ])
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('nativeVideoPlayer',{static: true}) _videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('nativeSource',{static: true}) _nativeSource: ElementRef<HTMLSourceElement>;
  @ViewChild('fullScreenElement',{static: true}) _fullScreenElement: ElementRef<HTMLDivElement>;

  private _garbage: Subscription[] = [];
  private _playlist: RxDocument<Playlist<RxDocument<Episode>>>;

  public canplay$: Observable<Event>;

  public get playlist(): RxDocument<Playlist<RxDocument<Episode>>>|null {
    return this._playlist;
  }

  public get episodes(): RxDocument<Episode>[] {
    if ( this._playlist )
      return this._playlist.episodes;
    return [];
  }

  public get previous_episode(): RxDocument<Episode>|null{
    if ( this._playlist ) {
      const last_seen = this._playlist.last_seen_episode;
      if ( last_seen - 1 >= 0)
        return this._playlist.episodes[this._playlist.last_seen_episode - 1];
    }
    return null;
  }

  public get next_episode(): RxDocument<Episode>|null{
    if ( this._playlist ) {
      const last_seen = this._playlist.last_seen_episode;
      if ( last_seen + 1 < this.episodes.length)
        return this._playlist.episodes[this._playlist.last_seen_episode + 1];
    }
    
    return null;
  }
  public get current_episode(): RxDocument<Episode>|null {
    if ( this._playlist ) {
      const last_seen = this._playlist.last_seen_episode;
      return this.episodes[last_seen];
    }
  }

  public set current_episode(episode: RxDocument<Episode>) {
    this.playlist.update({
      $set: {
        last_seen_episode: episode.number
      }
    });
    episode.update({
      $set: {
        last_seen: new Date
      }
    });

    this.canplay$.pipe(
      take(1)
    ).subscribe(
      e => this.resumeVideo.bind(this)
    )
  }
  
  private get fullscrenElement(): HTMLDivElement {
    return document.body as any;
  }
  private get video(): HTMLVideoElement {
    return this._videoElement.nativeElement;
  }
  private get source(): HTMLSourceElement {
    return this._nativeSource.nativeElement;
  }

  menuVisibility: boolean = true;
  constructor(
    private activatedRoute: ActivatedRoute,
    private playlist_service: PlaylistService,
    private bottomSheet: MatBottomSheet
  ) { }
  ngOnDestroy(): void {
    screen.orientation.unlock();
    document.exitFullscreen().catch(err => void 0);
    for ( let garbage of this._garbage )
      garbage.unsubscribe();
  }


  ngOnInit(): void {
    this.setupEvents(this.video);
    this.activatedRoute.paramMap.subscribe(this.onParams.bind(this));

    this.setupGarbage();
    
  }

  // events subscriptio is garbage, it has to be removed on ngOnDestroy, so keep it here
  public setupGarbage() {
    // makes UI visible after touched
    this._garbage.push(merge(
      this.visibility$.pipe(map(e => ({ v: e }))),
      this.playing$.pipe(map(e => ({ p: e })))
    ).pipe(
      debounceTime(4000),
    ).subscribe(
      (state: { v?: boolean, p?: boolean }) => {
        if (state.v && this.playing)
          this.menuVisibility = false;
        if (state.p && this.menuVisibility)
          this.menuVisibility = false;
      }
    )
    );
    
    // updates video time
    this._garbage.push(
      this.time$.pipe(
        throttleTime(5000)
      ).subscribe(
        time => {
          let episode = this.current_episode;
          if (episode) {
            episode.update({
              $set: {
                time: Math.round(time)
              }
            })
          }
        }
      )
    );

    // go to next episode if current ended
    this._garbage.push(
      this.videoEnded$.subscribe(
        event => {
          this.setEpisode(this.next_episode);
        }
      )
    )


  }

  onParams( params: ParamMap ) {
    const playlist_uuid = params.get('uuid');
    this.playlist_service.getPlaylist(playlist_uuid).subscribe(
      playlist => {
        this._playlist = playlist;
        playlist.update({
          $set: {
            last_seen: new Date
          }
        });
        this.current_episode.update({
          $set: {
            last_seen: new Date
          }
        });
        this.canplay$.pipe(
          throttleTime(100),
          take(1),
        ).subscribe(
          this.resumeVideo.bind(this)
        )
          
      }
    )
  }
  /**
   * @description Resumes video if span < time < duration - span

   */
  private resumeVideo(event: Event) {
    const span: number = 60;
    const episode = this.current_episode;
    if ( episode.time > span && episode.time < this.duration - span ) {
      this.time = episode.time;
    }
    
  }

  private setupEvents( tag: HTMLVideoElement ) {
    const event$ = <K extends keyof HTMLMediaElementEventMap>(event: K) => fromEvent(tag,event);

    this.time$ = event$('timeupdate').pipe(
      map(event => (event.target as HTMLVideoElement).currentTime)
    ).pipe(
      share()
    );
    this.playing$ = merge(
      event$('play').pipe(mapTo(true)),
      event$('pause').pipe(mapTo(false)),
      of(!tag.paused)
    ).pipe(
      share()
    );
    this.volume$ = merge(
      event$('volumechange'),
      of(this.volume)
      ).pipe(
        map( event => this.volume),
        share()
    );

    this.fullscreen$ = merge(
      fromEvent(this.fullscrenElement,'fullscreenchange').pipe(
        map( event => event.target == document.fullscreenElement )
      ),
      of(false)
    ).pipe(
      share()
    );

    this.videoEnded$ = event$('ended').pipe(
      share()
    );


    this.canplay$ = event$("canplay").pipe(
      share()
    )
  }

  public playing$: Observable<boolean>;
  public set playing(value: boolean) {
    if( value ) {
      this.video.play();
      //this._resumeEventSubscrtiption = setTimeout( () => this.menuVisibility = false , 4000)
    }
    else
      //if ( this._resumeEventSubscrtiption )
      //  clearTimeout(this._resumeEventSubscrtiption);
      this.video.pause();
  }
  public get playing() {
    return !this.video.paused;
  }

  public get duration(): number {
    return this.video.duration;
  }

  public time$: Observable<number>;
  public get time(): number{
    return this.video.currentTime;
  }
  public set time(v: number) {
    this.video.currentTime = v;
  }

  public onChangeTime(t: MatSliderChange) {
    this.time = t.value;
  }

  public volume$: Observable<number>
  public get volume() {
    return this.video.volume;
  }
  public set volume(value: number) {
    this.video.volume = value;
  } 
  public visibility$: Subject<boolean> = new Subject;
  public toggleVisibility( event: Event ) {
    let elem = (event.target as HTMLElement);    
    
    if ( elem.classList.contains('toggles-overlay') ){
      let state = this.menuVisibility = !this.menuVisibility;

      this.visibility$.next(state);
    }
    else if ( this.menuVisibility == true ) {
      let state = this.menuVisibility = true;
      
      this.visibility$.next(state);
    }
  }

  public fullscreen$: Observable<boolean>;
  public get fullscreen(): boolean {
    return this.fullscrenElement == document.fullscreenElement;
  }
  public toggleFullscreen() {
    if ( this.fullscreen )
      document.exitFullscreen();
    else
      this.fullscrenElement.requestFullscreen({}).then(
        () => screen.orientation.lock('landscape')
      ).catch(console.error)
  }

  public setEpisode( episode: RxDocument<Episode>) {
    if( episode )
      this.current_episode = episode;
  }

  public videoEnded$: Observable<Event>;

  public showPlaylist() {
    type RxEpisode = RxDocument<Episode>;
    let was_playing = this.playing;
    this.playing = false;

    const ref = this.bottomSheet
      .open<PickEpisodeComponent,PickEpisodeData,RxEpisode>(PickEpisodeComponent, {
        data: {
          episodes: this.episodes,
          current: this.current_episode.number
        },
    });

    ref.afterDismissed().subscribe(
      episode => {
        if ( episode !== this.current_episode )
          this.setEpisode(episode);
        else if ( was_playing )
          this.playing = true
      }
    );
    

  }
}
