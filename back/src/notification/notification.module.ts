import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { Notification } from './entities/notification.entity';
import { EventStreamModule } from '../SSE/sse.module'; // Import the EventStreamModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EventStreamModule, // Add EventStreamModule to imports
  ],
  providers: [
    NotificationService,
    NotificationResolver,
  ],
  exports: [
    NotificationService,
  ],
})
export class NotificationModule {}