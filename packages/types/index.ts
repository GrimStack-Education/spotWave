// Интерфейсы и типы для API ответов и сущностей
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
}

// Интерфейсы для пользователей
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'B2B_ADMIN';
  createdAt: string;
}

// Интерфейсы для событий
export interface CreateUserDto {
  email: string;
  name?: string;
  password?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {} // Все поля необязательные для обновления

export * from './firebase'; // Экспорт типов из firebase.types.ts
