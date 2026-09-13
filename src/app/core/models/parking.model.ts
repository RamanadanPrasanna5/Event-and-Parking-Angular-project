export interface ParkingSlotDto {
  id: number;
  eventId: number;
  zone: string;
  slotNumber: number;
  fee: number;
  status: 'Available' | 'Reserved';
}

export interface GenerateParkingLayoutDto {
  zone: string;
  numberOfSlots: number;
  defaultFee: number;
}

export interface UpdateParkingSlotDto {
  zone: string;
  slotNumber: number;
  fee: number;
}

export interface ReserveParkingDto {
  parkingSlotId: number;
}
