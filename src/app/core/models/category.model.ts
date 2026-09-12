export interface EventCategory {
  id: number;
  name: string;
  description: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
}
