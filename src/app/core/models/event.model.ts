export interface EventDto {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  availableSeats?: number;
  venueName: string;
  categoryName: string;
  status: string;
  imageUrl: string;
  image?: string;
  price?: number;
  venueId?: number;
  categoryId?: number;
}

export interface CreateEventDto {
  title: string;
  description: string;
  eventDate: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  availableSeats?: number;
  venueId: number;
  categoryId: number;
  imageUrl: string;
  price?: number;
}
