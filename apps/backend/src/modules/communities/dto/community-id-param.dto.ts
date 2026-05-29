import { IsUUID } from 'class-validator';

export class CommunityIdParamDto {
  @IsUUID('4')
  id!: string;
}
