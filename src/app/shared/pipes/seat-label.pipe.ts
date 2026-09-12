import { Pipe, PipeTransform } from '@angular/core';
import { SeatDto } from '../../core/models/seat.model';

@Pipe({
  name: 'seatLabel',
  standalone: true
})
export class SeatLabelPipe implements PipeTransform {
  transform(seat: SeatDto | null | undefined): string {
    if (!seat) return '';
    const num = seat.seatNumber < 10 ? `0${seat.seatNumber}` : `${seat.seatNumber}`;
    return `${seat.row}-${num}`;
  }
}
