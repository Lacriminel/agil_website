import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  governorateId: number;
}

export class UpdatePlaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  governorateId?: number;
}
