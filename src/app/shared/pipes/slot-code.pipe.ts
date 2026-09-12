import { Pipe, PipeTransform } from '@angular/core';
import { ParkingSlotDto } from '../../core/models/parking.model';

@Pipe({
  name: 'slotCode',
  standalone: true
})
export class SlotCodePipe implements PipeTransform {
  transform(slot: ParkingSlotDto | null | undefined): string {
    if (!slot) return 'No Parking';
    const num = slot.slotNumber < 10 ? `0${slot.slotNumber}` : `${slot.slotNumber}`;
    return `Zone ${slot.zone} — #${num}`;
  }
}
