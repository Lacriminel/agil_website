import {
  Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { TrucksService } from '../trucks/trucks.service';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/user.entity';

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerApiController {
  constructor(
    private readonly trucksService: TrucksService,
    private readonly ordersService: OrdersService,
    private readonly customersService: CustomersService,
  ) {}

  @Get('trucks')
  async getAvailableTrucks() {
    const trucks = await this.trucksService.findAll({ status: 'AVAILABLE' as any });
    return trucks;
  }

  @Get('trucks/:id')
  async getTruck(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.findById(id);
  }

  @Post('orders')
  async createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    const customer = await this.customersService.findByUserId(user.id);
    return this.ordersService.create(customer.id, dto.items);
  }

  @Get('orders')
  async getMyOrders(@CurrentUser() user: User) {
    const customer = await this.customersService.findByUserId(user.id);
    return this.ordersService.findByCustomer(customer.id);
  }

  @Get('orders/:id')
  async getMyOrder(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    const customer = await this.customersService.findByUserId(user.id);
    return this.ordersService.findByIdForCustomer(id, customer.id);
  }

  @Delete('orders/:id')
  async cancelOrder(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    const customer = await this.customersService.findByUserId(user.id);
    return this.ordersService.cancel(id, customer.id);
  }
}
