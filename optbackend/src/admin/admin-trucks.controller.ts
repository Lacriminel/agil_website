import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, TruckStatus } from '../common/enums';
import { TrucksService } from '../trucks/trucks.service';
import { CreateTruckDto, UpdateTruckDto } from './dto/truck.dto';

@Controller('admin/trucks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTrucksController {
  constructor(private readonly trucksService: TrucksService) {}

  @Get()
  findAll(
    @Query('status') status?: TruckStatus,
    @Query('groupId') groupId?: string,
  ) {
    return this.trucksService.findAll({
      status,
      groupId: groupId ? +groupId : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateTruckDto) {
    return this.trucksService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTruckDto) {
    return this.trucksService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.delete(id);
  }
}
