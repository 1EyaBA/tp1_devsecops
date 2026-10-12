import { PartialType } from '@nestjs/mapped-types';
import { CreateAppUserRideDto } from './create-app-user-ride.dto';

export class UpdateAppUserRideDto extends PartialType(CreateAppUserRideDto) {}
