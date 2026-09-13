export interface CustomerProfileDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export interface UpdateProfileDto {
  name: string;
  phone: string;
}

export interface CustomerAdminView {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}
