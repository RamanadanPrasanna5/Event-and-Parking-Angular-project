export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  isActive?: boolean;
}

export interface CreateVenueDto {
  name: string;
  location: string;
  capacity: number;
}
