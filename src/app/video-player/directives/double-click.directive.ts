import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { buffer, debounceTime, filter, map, tap, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[doubleClick]'
})
export class DoubleClickDirective implements OnDestroy {
  @Output('doubleClick') event: EventEmitter<Event>;
  public subscription: Subscription;

  constructor(private elem: ElementRef<HTMLElement>) { 
    this.event = new EventEmitter();

    const click$ = fromEvent(elem.nativeElement,'click');

    const doubleClick$ = click$.pipe(
      buffer(click$.pipe(debounceTime(250))),
      filter(e => e.length > 1),
      map(e => e[e.length-1]),
    );
    if ( false ) {
      this.subscription = doubleClick$.subscribe(
        ev => this.event.next(ev)
      );
    }
    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
