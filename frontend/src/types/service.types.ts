export interface Service {
  id: number;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  duration: number;
  durationMinutes?: number;
  price: number;
}
