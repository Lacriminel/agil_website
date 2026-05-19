import { Controller, Get, Patch, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '../common/enums';
import { OrdersService } from '../orders/orders.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.findAll({
      status,
      customerId: customerId ? +customerId : undefined,
      from,
      to,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.confirm(id);
  }

  @Patch(':id/deliver')
  deliver(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deliver(id);
  }
}
