import { Module } from '@nestjs/common';
import { TrucksModule } from '../trucks/trucks.module';
import { GovernoratesModule } from '../governorates/governorates.module';
import { PlacesModule } from '../places/places.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { AdminTrucksController } from './admin-trucks.controller';
import { AdminGovernoratesController } from './admin-governorates.controller';
import { AdminPlacesController } from './admin-places.controller';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminOrdersController } from './admin-orders.controller';

@Module({
  imports: [TrucksModule, GovernoratesModule, PlacesModule, CustomersModule, OrdersModule],
  controllers: [
    AdminTrucksController,
    AdminGovernoratesController,
    AdminPlacesController,
    AdminCustomersController,
    AdminOrdersController,
  ],
})
export class AdminModule {}
