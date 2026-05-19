// Global API Response wrapper
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}

// User Entity Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'B2B_ADMIN';
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
