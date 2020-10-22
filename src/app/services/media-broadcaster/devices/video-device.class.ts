import { Observable } from 'rxjs';

export interface VideoDevice {
  source$: Observable<string>;
  source: string;

  playing$: Observable<boolean>;
  playing: boolean;

  time$: Observable<number>;
  time: number;

  ready$: Observable<boolean>;
  ready: boolean;

  duration$: Observable<number>;
  readonly duration: number;

  ended$: Observable<boolean>;
  readonly ended: boolean;

  volume$: Observable<number>;
  volume: number;

  connected$: Observable<Event>;
  disconnected$: Observable<Event>
  $: Observable<Event>;

  readonly isRemote: boolean;

}