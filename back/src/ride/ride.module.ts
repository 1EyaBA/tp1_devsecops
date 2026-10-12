import { forwardRef, Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { Ride } from './entities/ride.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideResolver } from './ride.resolver';
import { Post } from 'src/post/entities/post.entity';
import { PostModule } from 'src/post/post.module';
import { RideSchedulerService } from './ride-scheduler.service';
import { AppUserModule } from 'src/app-user/app-user.module';
import { EventStreamModule } from 'src/SSE/sse.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { AppUserRideModule } from 'src/app-user-ride/app-user-ride.module';
import { PaginationService } from 'src/services/paginationService';
import { SearchService } from 'src/services/searchService';
import { NotificationModule } from 'src/notification/notification.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride,Post,User]),forwardRef(() => PostModule), AppUserModule,AppUserRideModule,
  EventStreamModule,SubscriptionModule,NotificationModule ],
  controllers: [RideController], 
  providers: [RideService,RideResolver,RideSchedulerService,PaginationService,SearchService],
  exports: [RideService]
})
export class RideModule {}