import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { CommentResolver } from './comment.resolver';
import { Comment } from './entities/comment.entity';
import { AppUserModule } from 'src/app-user/app-user.module';
import { PostModule } from 'src/post/post.module';
import { EventStreamModule } from 'src/SSE/sse.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports:[TypeOrmModule.forFeature([Comment, Post, AppUser]),AppUserModule,PostModule,EventStreamModule,SubscriptionModule,NotificationModule],
  controllers: [CommentController],
  providers: [CommentService,CommentResolver],
    exports: [CommentService],
})
export class CommentModule {}
