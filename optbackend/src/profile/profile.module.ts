import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
