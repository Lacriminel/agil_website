import { Module } from '@nestjs/common';
import { TrucksModule } from '../trucks/trucks.module';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { CustomerApiController } from './customer-api.controller';

@Module({
  imports: [TrucksModule, OrdersModule, CustomersModule],
  controllers: [CustomerApiController],
})
export class CustomerApiModule {}
