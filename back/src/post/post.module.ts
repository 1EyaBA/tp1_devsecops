import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostResolver } from './post.resolver';
import { Ride } from 'src/ride/entities/ride.entity';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { AppUserModule } from 'src/app-user/app-user.module';
import { RideModule } from 'src/ride/ride.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { SearchService } from 'src/services/searchService';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Ride, AppUser]),AppUserModule,forwardRef(() => RideModule),SubscriptionModule,NotificationModule],
  controllers: [PostController],
  providers: [PostService,PostResolver,SearchService],
  exports: [PostService],
})
export class PostModule {}
