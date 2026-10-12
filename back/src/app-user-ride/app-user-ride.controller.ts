import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppUserRideService } from './app-user-ride.service';
import { CreateAppUserRideDto } from './dto/create-app-user-ride.dto';
import { UpdateAppUserRideDto } from './dto/update-app-user-ride.dto';

@Controller('app-user-ride')
export class AppUserRideController {
  constructor(private readonly appUserRideService: AppUserRideService) {}

  @Post()
  create(@Body() createAppUserRideDto: CreateAppUserRideDto) {
    return this.appUserRideService.create(createAppUserRideDto);
  }

  @Get()
  findAll() {
    return this.appUserRideService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appUserRideService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppUserRideDto: UpdateAppUserRideDto) {
    return this.appUserRideService.update(+id, updateAppUserRideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUserRideService.remove(+id);
  }
}
