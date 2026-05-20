import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { GovernoratesModule } from './governorates/governorates.module';
import { PlacesModule } from './places/places.module';
import { TrucksModule } from './trucks/trucks.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { CustomerApiModule } from './customer-api/customer-api.module';
import { ProfileModule } from './profile/profile.module';
import { User } from './users/user.entity';
import { Customer } from './customers/customer.entity';
import { GovernorateGroup } from './governorates/governorate-group.entity';
import { Governorate } from './governorates/governorate.entity';
import { Place } from './places/place.entity';
import { Truck } from './trucks/truck.entity';
import { Compartment } from './trucks/compartment.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
     useFactory: (config: ConfigService) => ({
  type: 'mysql',
  host: config.get('DB_HOST', 'localhost'),
  port: +config.get<number>('DB_PORT', 3306),
  username: config.get('DB_USER', 'root'),
  password: config.get('DB_PASS', ''),
  database: config.get('DB_NAME', 'agil_db'),
  entities: [
    User, Customer, GovernorateGroup, Governorate,
    Place, Truck, Compartment, Order, OrderItem,
  ],
  synchronize: true,
  charset: 'utf8mb4',
  ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
}),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    GovernoratesModule,
    PlacesModule,
    TrucksModule,
    OrdersModule,
    AdminModule,
    CustomerApiModule,
    ProfileModule,
  ],
})
export class AppModule {}
