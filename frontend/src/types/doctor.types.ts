export interface DoctorInfo {
  id: number;
  userId: number;
  specialization: string;
  experience: number;
  user: {
    id: number;
    fullName: string;
  };
}
