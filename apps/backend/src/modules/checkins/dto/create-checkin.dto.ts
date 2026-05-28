import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventCheckInMethod } from '@spotwave/database';

export class CreateCheckInDto {
  @IsEnum(EventCheckInMethod)
  method!: EventCheckInMethod;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  code?: string;
}
