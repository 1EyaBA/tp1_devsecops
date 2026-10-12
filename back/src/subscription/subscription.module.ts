
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { EventStreamModule } from 'src/SSE/sse.module';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Subscription]),
    
    
  ],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
  
})
export class SubscriptionModule {}
