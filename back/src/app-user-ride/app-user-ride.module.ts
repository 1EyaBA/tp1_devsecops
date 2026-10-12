import { Module } from '@nestjs/common';
import { AppUserRideService } from './app-user-ride.service';
import { AppUserRideController } from './app-user-ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserRide } from './entities/app-user-ride.entity';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { EventStreamModule } from 'src/SSE/sse.module';
import { AppUserRideResolver } from './app-user-ride.resolver';

@Module({
  controllers: [AppUserRideController],
  imports: [TypeOrmModule.forFeature([AppUserRide]),SubscriptionModule,EventStreamModule],
  providers: [AppUserRideService,AppUserRideResolver], 
  exports: [AppUserRideService]
})
export class AppUserRideModule {}
