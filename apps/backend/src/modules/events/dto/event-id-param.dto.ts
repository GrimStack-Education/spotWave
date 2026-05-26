import { IsUUID } from 'class-validator';

export class EventIdParamDto {
  @IsUUID()
  id!: string;
}
