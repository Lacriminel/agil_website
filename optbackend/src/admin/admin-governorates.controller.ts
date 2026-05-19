import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { GovernoratesService } from '../governorates/governorates.service';
import {
  CreateGroupDto, UpdateGroupDto,
  CreateGovernorateDto, UpdateGovernorateDto,
} from './dto/governorate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminGovernoratesController {
  constructor(private readonly govService: GovernoratesService) {}

  @Get('governorate-groups')
  findAllGroups() { return this.govService.findAllGroups(); }

  @Post('governorate-groups')
  createGroup(@Body() dto: CreateGroupDto) { return this.govService.createGroup(dto.name); }

  @Patch('governorate-groups/:id')
  updateGroup(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGroupDto) {
    return this.govService.updateGroup(id, dto.name);
  }

  @Delete('governorate-groups/:id')
  deleteGroup(@Param('id', ParseIntPipe) id: number) { return this.govService.deleteGroup(id); }

  @Get('governorates')
  findAllGovernorates() { return this.govService.findAllGovernorates(); }

  @Post('governorates')
  createGovernorate(@Body() dto: CreateGovernorateDto) {
    return this.govService.createGovernorate(dto.name, dto.governorateGroupId);
  }

  @Patch('governorates/:id')
  updateGovernorate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGovernorateDto) {
    return this.govService.updateGovernorate(id, dto);
  }

  @Delete('governorates/:id')
  deleteGovernorate(@Param('id', ParseIntPipe) id: number) {
    return this.govService.deleteGovernorate(id);
  }
}
