import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { MessageService } from 'src/message/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/user/entities/user.entity';
import { Ride } from 'src/ride/entities/ride.entity';
import { MessageModule } from 'src/message/message.module';
import { ChatResolver } from './chat.resolver';
import { UserService } from 'src/user/user.service';
import { RideService } from 'src/ride/ride.service';
import { Message } from 'src/message/entities/message.entity';
import { PaginationService } from 'src/services/paginationService';
import { AppUserRideModule } from 'src/app-user-ride/app-user-ride.module';
import { AppUserRideService } from 'src/app-user-ride/app-user-ride.service';
import { AppUserService } from 'src/app-user/app-user.service';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { Review } from 'src/review/entities/review.entity';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { EventStreamService } from 'src/SSE/sse-subscription.service';
import { SearchService } from 'src/services/searchService';
import { Subscription } from '@nestjs/graphql';
import { EventStreamModule } from 'src/SSE/sse.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { AppUserRide } from 'src/app-user-ride/entities/app-user-ride.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User, Ride, Message, AppUser, Review,Subscription, AppUserRide]),
    MessageModule,
    AppUserRideModule,EventStreamModule,NotificationModule ,SubscriptionModule
  ],
  controllers: [ChatController],
  providers: [
    ChatService, 
    ChatGateway,
    ChatResolver,
    UserService,
    MessageService,
    RideService,
    PaginationService,
    AppUserRideService,
    AppUserService,
    SubscriptionService,
    EventStreamService ,
    SearchService
  ],
})
export class ChatModule {}