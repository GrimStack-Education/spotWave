import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsLatitude, IsLongitude, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdateOnboardingDto {
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  homeLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  homeLng?: number;

  @Type(() => Number)
  @Min(1)
  @Max(100)
  radiusKm!: number;

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  interestIds!: string[];
}
