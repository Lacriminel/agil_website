import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { PlacesService } from '../places/places.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place.dto';

@Controller('admin/places')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  findAll(
    @Query('governorateId') governorateId?: string,
    @Query('unassigned') unassigned?: string,
  ) {
    return this.placesService.findAll({
      governorateId: governorateId ? +governorateId : undefined,
      unassigned: unassigned === 'true',
    });
  }

  @Post()
  create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto.name, dto.governorateId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.delete(id);
  }
}
