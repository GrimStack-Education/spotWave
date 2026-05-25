import { IsUUID } from 'class-validator';

export class GetUserParamsDto {
  @IsUUID()
  id!: string;
}
