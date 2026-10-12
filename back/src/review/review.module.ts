import { Module, Search } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { PaginationService } from 'src/services/paginationService';
import { SearchService } from 'src/services/searchService';
import { UserService } from 'src/user/user.service';
import { AppUserService } from 'src/app-user/app-user.service';
import { AppUserModule } from 'src/app-user/app-user.module';
import { ReviewResolver } from './review.resolver';
import { RideModule } from 'src/ride/ride.module';
import { EventStreamService } from 'src/SSE/sse-subscription.service';
import { EventStreamModule } from 'src/SSE/sse.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports:[TypeOrmModule.forFeature([Review]),AppUserModule,RideModule,EventStreamModule,NotificationModule,SubscriptionModule],
  controllers: [ReviewController],
  providers: [ReviewService,PaginationService,SearchService,ReviewResolver,EventStreamService ],
  exports: [ReviewService],
})
export class ReviewModule {}
