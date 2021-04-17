import Hls, { Level } from 'hls.js';
import { BehaviorSubject, EMPTY, fromEvent, merge, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, share, tap } from 'rxjs/operators';
import { VideoDevice } from './video-device.class';

export class VideoElementDevice implements VideoDevice {
  private _source$: BehaviorSubject<string> = new BehaviorSubject(null);
  private hls: Hls;
  public $: Observable<Event>;

  public source$: Observable<string>;


  private set _source( src: string ) {
    if ( this.hls ){
      this.hls.detachMedia();
      this.hls.destroy();
      this.hls = null;
      window['hls'] = null;
    }

    if ( src.match(/\.(m3u8)$/)) {
      this.hls = new Hls({ autoStartLoad: true, maxBufferLength: 60*4 });
      
      this.hls.loadSource( src );
      this.hls.attachMedia( this._videoElement );
      //this.hls.once(Hls.Events.FRAG_LOADED, event => {
      //  this.hls.currentLevel = -1 //this.hls.levels.length - 1;
      //  
      //});
      this.hls.on(Hls.Events.FRAG_CHANGED, event => {
        this.hls.nextLevel = this.hls.levels.length - 1;
      });
      window['hls'] = this.hls;
      
    }
    else {
      this._videoElement.src = src;
    }
  }

  public set source(src: string){
    // this._videoElement.src = src;
    this._source = src;
    this._source$.next(src);
  }

  public get source(): string {
    return this._videoElement.src;
  }

  
  public levels$: BehaviorSubject<Level[]> = new BehaviorSubject([]);

  public get level() {
    if ( this.hls ) {
      return this.hls.currentLevel;
    }
    return -1;
  }
  public set level(value: number) {
    if ( this.hls )
      this.hls.currentLevel = value;
  }

  public playing$: Observable<boolean>;
  public get playing(): boolean { return !this._videoElement.paused }
  public set playing(v: boolean) { 
    if ( v )
      this._videoElement.play();
    else
      this._videoElement.pause() 
  }

  public time$: Observable<number>;
  public get time(): number { return this._videoElement.currentTime; }
  public set time( t: number ) { this._videoElement.currentTime = t; }

  public ended$: Observable<boolean>;
  public get ended(): boolean { return this._videoElement.ended }

  public ready$: Observable<boolean>;
  public get ready(): boolean { return !!this._videoElement.readyState } 

  public duration$: Observable<number>;
  public get duration(): number { return this._videoElement.duration; }

  public volume$: Observable<number>;
  public get volume(): number { return this._videoElement.volume };
  public set volume( value: number ) { this._videoElement.volume = value; }

  public connected$: Observable<Event>;
  public disconnected$: Observable<Event>;

  public get isRemote(): boolean { return false; }
  constructor( private _videoElement: HTMLVideoElement ) {
    const event$ = <K extends keyof HTMLMediaElementEventMap>(event: K) => 
      fromEvent(_videoElement,event);

    // base event observable
    this.$ = merge(
      event$('play'),
      event$('pause'),
      event$('timeupdate'),
      event$('canplay'),
      event$('ended'),
      event$('volumechange'),
      this._source$.asObservable().pipe(
        map( e => {
          let event = new Event('sourcechanged');
          Object.defineProperty(event,'target',{get: () => _videoElement });
          return event;
        })
      )
    ).pipe(
      share()
    );
    
    this.source$ = this._source$.asObservable().pipe(
      filter( e => !!e),
      share()
    );

    this.playing$ = this.$.pipe(
      filter( event => event.type == 'play' || event.type == 'pause'),
      map( event => event.type == 'play'),
      share()
    );

    this.time$ = this.$.pipe(
      filter( event => event.type == 'timeupdate'),
      map( d => this.time | 0 ),
      distinctUntilChanged(),
      share()
    );

    this.ended$ = this.$.pipe(
      filter(event => event.type == 'ended'),
      mapTo(true),
      share()
    );

    let loading$ = this.$.pipe(
      filter( event => event.type == 'waiting'|| event.type == 'seeking' || event.type == 'stalled' || event.type == 'sourcechanged'),
      mapTo(false)
    )

    let ready$ = this.$.pipe(
      filter(event => event.type == 'canplay' ),
      mapTo(true)
    );
    this.ready$ = merge(ready$,loading$).pipe( share() );
    //this.ready$.subscribe(ready => console.info({ready}));
    

    this.duration$ = this.ready$.pipe(
      map( () => this._videoElement.duration),
      share()
    );

    this.volume$ = merge(
        of(1),
        this.$.pipe(
          filter( e => e.type == 'volumechange'),
          map( e => this.volume ),
        )
      ).pipe(
      share()
    )

    this.connected$ = EMPTY;
    this.disconnected$ = EMPTY;
    
    
  }
}