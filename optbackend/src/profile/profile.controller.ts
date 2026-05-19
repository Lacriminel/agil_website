import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CustomersService } from '../customers/customers.service';
import { User } from '../users/user.entity';
import { UserRole } from '../common/enums';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getProfile(@CurrentUser() user: User) {
    if (user.role === UserRole.CUSTOMER) {
      const customer = await this.customersService.findByUserId(user.id);
      return { user: { id: user.id, email: user.email, role: user.role }, customer };
    }
    return { user: { id: user.id, email: user.email, role: user.role } };
  }
}
