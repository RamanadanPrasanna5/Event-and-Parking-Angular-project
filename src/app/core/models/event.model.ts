export interface EventDto {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  endTime?: string;
  capacity: number;
  venueName: string;
  categoryName: string;
  status: string;
  imageUrl: string;
  venueId?: number;
  categoryId?: number;
}

export interface CreateEventDto {
  title: string;
  description: string;
  eventDate: string;
  endTime: string;
  capacity: number;
  venueId: number;
  categoryId: number;
  imageUrl: string;
}
