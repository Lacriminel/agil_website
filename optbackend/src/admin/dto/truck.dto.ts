import { IsString, IsInt, IsEnum, IsOptional, MinLength } from 'class-validator';
import { TruckStatus } from '../../common/enums';

export class CreateTruckDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  governorateGroupId: number;

  @IsString()
  comboKey: string;
}

export class UpdateTruckDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  governorateGroupId?: number;

  @IsOptional()
  @IsEnum(TruckStatus)
  status?: TruckStatus;
}
