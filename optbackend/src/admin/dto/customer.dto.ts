import { IsString, IsEmail, IsInt, IsOptional, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsInt()
  placeId: number;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
