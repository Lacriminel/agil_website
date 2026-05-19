import { IsString, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(1)
  name: string;
}

export class UpdateGroupDto {
  @IsString()
  @MinLength(1)
  name: string;
}

export class CreateGovernorateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  governorateGroupId: number;
}

export class UpdateGovernorateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  governorateGroupId?: number;
}
