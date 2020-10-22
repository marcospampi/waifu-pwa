import { BehaviorSubject, EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, share } from 'rxjs/operators';
import { VideoDevice } from './video-device.class';

export class VideoElementDevice implements VideoDevice {
  private _source$: BehaviorSubject<string> = new BehaviorSubject(null);
  
  public $: Observable<Event>;

  public source$: Observable<string>;
  public set source(src: string){
    this._videoElement.src = src;
    this._source$.next(src);
  }
  public get source(): string {
    return this._videoElement.src;
  }

  public playing$: Observable<boolean>;
  public get playing(): boolean { return !this._videoElement.paused }

  public time$: Observable<number>;
  public get time(): number { return this._videoElement.currentTime; }
  public set time( t: number ) { this._videoElement.currentTime = t; }

  public ended$: Observable<boolean>;
  public get ended(): boolean {return this._videoElement.ended }

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

    this.ready$ = this.$.pipe(
      filter(event => event.type == 'canplay'),
      mapTo(true),
      share()
    );
    
    this.duration$ = this.ready$.pipe(
      map( () => this._videoElement.duration),
      share()
    );

    this.volume$ = this.$.pipe(
      filter( e => e.type == 'volumechange'),
      map( e => this.volume ),
      share()
    )

    this.connected$ = EMPTY;
    this.disconnected$ = EMPTY;
    
  }
}