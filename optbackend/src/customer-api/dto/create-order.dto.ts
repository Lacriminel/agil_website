import { IsArray, IsEnum, IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { GasType } from '../../common/enums';

export class OrderItemDto {
  @IsInt()
  compartmentId: number;

  @IsEnum(GasType)
  gasType: GasType;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
