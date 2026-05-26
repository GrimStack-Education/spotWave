export class UserResponseDto {
  id!: string;
  email!: string;
  role!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
