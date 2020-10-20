import { Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: number): string {

    const _seconds = (value % 60) | 0;
    const _minutes = ((value / 60) % 60) | 0;
    const _hours = (value / 3600) | 0;

    if (_hours >= 1) {
      const SS = _seconds.toFixed(0).padStart(2, "0");
      const MM = _minutes.toFixed(0).padStart(2, "0");
      const HH = _hours.toFixed(0).padStart(2, "0");
      return `${HH}:${MM}:${SS}`
    }
    else {
      const SS = _seconds.toFixed(0).padStart(2, "0");
      const MM = _minutes.toFixed(0).padStart(2, "0");
      return `${MM}:${SS}`

    }
  }

}
