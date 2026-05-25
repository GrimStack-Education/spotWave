import {
  IsDateString,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsString()
  firebaseEventId!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  venueId!: string;
}
