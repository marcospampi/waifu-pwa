/// <reference types="chromecast-caf-sender" />

import { BehaviorSubject, EMPTY, fromEvent, merge, Observable, of, pipe, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, retry, share, take, tap } from 'rxjs/operators';
import { VideoDevice } from './video-device.class';

const constants = {
  mime_regexp: /\.((?<mp4>(mp4|m4a|m4p|m4b|m4r|m4v|mkv))|(?<hls>(m3u8|m3u))|(?<webm>(webm)))$/,
  mime_map: {
    mp4: 'video/mp4',
    webm: 'video/webm',
    hls: 'application/vnd.apple.mpegurl'
  }
}

function getMimeFor( url: string ) {
  let match = constants.mime_regexp.exec( url )
  if ( match && match.groups ) {
    const matchedEntry = Object.entries(match.groups).find( ([key, value]) => value != null );
    if ( matchedEntry ) {
      let key = matchedEntry[0];
      return constants.mime_map[key];
    }
  }
  throw `Invalid source: ${url}`;
}

export class ChromecastDevice implements VideoDevice {



  private player: cast.framework.RemotePlayer;
  private playerController: cast.framework.RemotePlayerController;

  private _source$: BehaviorSubject<string> = new BehaviorSubject(null);
  private _events$: Subject<Event|any> = new Subject();

  public $: Observable<Event|any>;

  public source$: Observable<string>;
  public get source(): string {
    return this._source$.value;
  }
  public set source(src: string ) {
    this._source$.next(src)
  }

  public playing$: Observable<boolean>;
  public get playing(): boolean { 
    if ( this.player )
      return !this.player.isPaused;
    return false;
  }
  public set playing(v: boolean) {

    let ctrl = this.playerController;
    if ( ctrl ) {
      ctrl.playOrPause()
    }
  }
  public time$: Observable<number>;
  public get time(): number { 
    if( this.player )
      return this.player.currentTime;
    return 0;
  };
  public set time(t: number ) { 
    let ctrl = this.playerController;
    let player = this.player;
    if ( ctrl && player ) {
      player.currentTime = t;
      ctrl.seek()
    }
  }

  public ready$: Observable<boolean>;
  public get ready(): boolean {
    if (this.player)
      return this.player.canSeek;
    return false;
  }

  public duration$: Observable<number>;
  public get duration(): number {
    if ( this.player ) {
      return this.player.duration;
    }
    return 0;
  }

  public ended$: Observable<boolean>;
  public ended: boolean;
  
  public volume$: Observable<number>;
  public get volume(): number { 
    if( this.player) {
      return this.player.volumeLevel;
    }
    return 1;
  };
  public set volume( value: number ) { 
    if( this.player )
      this.player.volumeLevel = value;
  }
  public connected$: Observable<Event> = EMPTY;
  public disconnected$: Observable<Event> = EMPTY;

  public get isRemote(): boolean { return true; } 

  constructor( private session: cast.framework.CastSession ) {
    this.$ = this._events$.asObservable().pipe(
      share()
    );

    this.source$ = this._source$.pipe(
      filter( e => !!e ),
      share()
    );

    this.source$.subscribe(
      this.onSourceChange.bind(this)
    )

    this.playing$ = this.$.pipe(
      map( (e: cast.framework.RemotePlayerChangedEvent) => !this.player.isPaused),
      distinctUntilChanged(),
      share()
    );

    
    this.ready$ = this.$.pipe(
      mapTo(true),
      share()
    );

    this.time$ = this.$.pipe(
      filter( e => e.type == cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED ),
      map(e => e.value |0)
    )

    this.ended$ = this.time$.pipe(
      filter ( e => this.duration - 1 <= e ),
      map(e => true),
      share()
    )


    this.duration$ = this.ready$.pipe(
      map(e => this.duration)
    );

    
    this.volume$ = merge(
      of(1),
      this.$.pipe(
        filter( e => e.type == cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED),
        map( e => this.volume ),
        share()
      )
    )
    

  }
  dispose() {
    this._events$.complete();
    this._source$.complete();
  }
  onSourceChange( source: string ) {
    try {
      let mime = getMimeFor( source );
      this._onSourceChange( source, mime );
    }
    catch( error ) {
      console.error(error);
      if ( typeof(error) == 'string') {
        
        alert(error);
      }
      else if ( error instanceof Error ) {
        alert(error.message)
      }
      
    }
    
  }
  _onSourceChange(source: string, mime: string) {
    let mediaInfo = new chrome.cast.media.MediaInfo(
      source, mime
    );

    let request = new chrome.cast.media.LoadRequest(mediaInfo);

    this.session.loadMedia(request)
      .then(
        success => {
          this.player = new cast.framework.RemotePlayer();
          this.playerController = new cast.framework.RemotePlayerController(this.player);

          const event$ = ( event: cast.framework.RemotePlayerEventType) => fromEvent(this.playerController,event);
          merge(
            event$(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED),
            event$(cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED),
            event$(cast.framework.RemotePlayerEventType.DURATION_CHANGED),
            event$(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED),
            event$(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED),
            event$(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED),
            event$(cast.framework.RemotePlayerEventType.CAN_CONTROL_VOLUME_CHANGED),
            event$(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED),
            event$(cast.framework.RemotePlayerEventType.CAN_PAUSE_CHANGED),
            event$(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED),
            event$(cast.framework.RemotePlayerEventType.DISPLAY_NAME_CHANGED),
            event$(cast.framework.RemotePlayerEventType.STATUS_TEXT_CHANGED),
            event$(cast.framework.RemotePlayerEventType.TITLE_CHANGED),
            event$(cast.framework.RemotePlayerEventType.DISPLAY_STATUS_CHANGED),
            event$(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED),
            event$(cast.framework.RemotePlayerEventType.IMAGE_URL_CHANGED),
            event$(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED),
            event$(cast.framework.RemotePlayerEventType.LIVE_SEEKABLE_RANGE_CHANGED)
          ).subscribe(
            event => this._events$.next(event)
          )

          
        }
      )
      .catch(
        error=> {

        }
      );
  }
}