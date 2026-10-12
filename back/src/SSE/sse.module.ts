
import { Module } from '@nestjs/common';
import { SseNotificationsController } from './sse-notifications.controller';
import { EventStreamService, SseSubscriptionService } from './sse-subscription.service';
import { Subscription } from '@nestjs/graphql';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [SubscriptionModule],
  controllers: [SseNotificationsController],
  providers: [EventStreamService, SseSubscriptionService],
  exports: [EventStreamService, SseSubscriptionService], 
})
export class EventStreamModule {}
