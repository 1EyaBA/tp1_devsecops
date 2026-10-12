import { Module } from '@nestjs/common';
import { JoinRequestService } from './join-request.service';
import { JoinRequestController } from './join-request.controller';
import { JoinRequestResolver } from './join-request.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequest } from './entities/join-request.entity';
import { EventStreamModule } from 'src/SSE/sse.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { Post } from 'src/post/entities/post.entity';
import { Ride } from 'src/ride/entities/ride.entity';
import { PostModule } from 'src/post/post.module';
import { RideModule } from 'src/ride/ride.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports:[TypeOrmModule.forFeature([JoinRequest,Post,Ride]),EventStreamModule,SubscriptionModule,PostModule,RideModule,NotificationModule],
  controllers: [JoinRequestController],
  providers: [JoinRequestService,JoinRequestResolver],
})
export class JoinRequestModule {}
