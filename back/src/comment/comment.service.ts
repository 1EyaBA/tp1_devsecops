import { Injectable, Logger } from '@nestjs/common';
import { GenericService } from 'src/services/genericService';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentInput } from './dto/create-comment.input';
import { AppUserService } from 'src/app-user/app-user.service';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { PostService } from 'src/post/post.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentService extends GenericService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    private readonly userService: AppUserService,
    private readonly postService: PostService,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
    private readonly notificationService: NotificationService
  ) {
    super(repo);
  }

  async createCommentWithNotif(createDto: CreateCommentInput, commenter: AppUser): Promise<Comment> {
    this.logger.log(`=== STARTING COMMENT CREATION ===`);
    this.logger.log(`Post ID: ${createDto.postId}, Commenter ID: ${commenter?.id}, Commenter Name: ${commenter?.name}`);
    
    try {
      // Step 1: Validate inputs
      if (!createDto || !createDto.postId) {
        throw new Error('CreateCommentInput or postId is missing');
      }
      
      if (!commenter || !commenter.id) {
        throw new Error('Commenter information is missing or invalid');
      }

      this.logger.log(`Step 1: Input validation passed`);

      // Step 2: Fetch the post
      this.logger.log(`Step 2: Fetching post with ID ${createDto.postId}`);
      const post = await this.postService.findOne(createDto.postId);
      
      if (!post) {
        this.logger.error(`Post with ID ${createDto.postId} not found`);
        throw new Error(`Post with ID ${createDto.postId} not found`);
      }
      
      this.logger.log(`Step 2: Post found - ID: ${post.id}`);

      // Step 3: Create and save the comment FIRST (before notifications)
      this.logger.log(`Step 3: Creating comment entity`);
      const comment = this.repo.create({
        text: createDto.text,
        date: new Date(),
        post,
        commenter,
      });

      this.logger.log(`Step 3: Saving comment to database`);
      const savedComment = await this.repo.save(comment);
      this.logger.log(`Step 3: Comment saved successfully with ID: ${savedComment.id}`);

      // Step 4: Subscribe the commenter to the post
      this.logger.log(`Step 4: Subscribing user ${commenter.id} to post ${post.id}`);
      try {
        // Using the correct parameter names from your SubscriptionService
        await this.subscriptionService.subscribe(
          commenter.id,  // subscriberId
          post.id,       // targetId  
          'post'         // targetType
        );
        this.logger.log(`Step 4: Subscription successful`);
      } catch (subscriptionError) {
        this.logger.error(`Step 4: Subscription failed:`, subscriptionError);
        // Don't throw here - comment is already created, continue with notifications
      }

      // Step 5: Get subscribers
      this.logger.log(`Step 5: Getting subscribers for post ${post.id}`);
      let subscribers: number[] = [];
      try {
        subscribers = await this.subscriptionService.getSubscribers(
          post.id,  // targetId
          'post'    // targetType
        );
        this.logger.log(`Step 5: Found ${subscribers.length} subscribers: [${subscribers.join(', ')}]`);
      } catch (subscribersError) {
        this.logger.error(`Step 5: Failed to get subscribers:`, subscribersError);
        // Return the comment even if notifications fail
        return savedComment;
      }

      // Step 6: Filter recipients (exclude the commenter)
      const recipientsToNotify = subscribers.filter(recipientId => recipientId !== commenter.id);
      this.logger.log(`Step 6: Will notify ${recipientsToNotify.length} recipients: [${recipientsToNotify.join(', ')}]`);

      if (recipientsToNotify.length === 0) {
        this.logger.log(`Step 6: No recipients to notify - returning comment`);
        return savedComment;
      }

      // Step 7: Create notifications
      this.logger.log(`Step 7: Creating ${recipientsToNotify.length} notifications`);
      const notificationPromises = recipientsToNotify.map(async (recipientId, index) => {
        this.logger.log(`Step 7.${index + 1}: Creating notification for user ${recipientId}`);
        try {
          const notification = await this.notificationService.commentNotification(
            recipientId,              // userId (recipient)
            post.id,                  // postId
            savedComment.id,          // commentId
            'New Comment',            // title
            `${commenter.name || 'Someone'} commented on a post`, // message
            `/posts`,       // actionUrl
            {
              commentId: savedComment.id,
              postId: post.id,
              commenterId: commenter.id,
              commenterName: commenter.name || 'Anonymous'
            }
          );
          this.logger.log(`Step 7.${index + 1}: Notification created successfully - ID: ${notification?.id}`);
          return notification;
        } catch (notificationError) {
          this.logger.error(`Step 7.${index + 1}: Notification failed for user ${recipientId}:`, notificationError);
          throw notificationError;
        }
      });

      
      this.logger.log(`Step 8: Waiting for all notifications to complete`);
      const results = await Promise.allSettled(notificationPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      this.logger.log(`Step 8: Notification results - Success: ${successful}, Failed: ${failed}`);
      
      if (failed > 0) {
        const failures = results
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .map(r => r.reason);
        this.logger.error(`Step 8: Failed notifications:`, failures);
      }

      this.logger.log(`=== COMMENT CREATION COMPLETED SUCCESSFULLY ===`);
      this.logger.log(`Comment ID: ${savedComment.id}, Notifications sent: ${successful}/${recipientsToNotify.length}`);
      
      return savedComment;

    } catch (error) {
      this.logger.error(`=== COMMENT CREATION FAILED ===`);
      this.logger.error(`Error:`, error);
      this.logger.error(`Stack:`, error.stack);
      throw error;
    }
  }

  async testServices(): Promise<any> {
    this.logger.log('=== TESTING SERVICES ===');
    
    const results: any = {
      postService: false,
      subscriptionService: false,
      notificationService: false,
      repository: false,
    };

    try {
      
      if (this.postService && typeof this.postService.findOne === 'function') {
        results.postService = true;
      }

       
      if (this.subscriptionService && 
          typeof this.subscriptionService.subscribe === 'function' &&
          typeof this.subscriptionService.getSubscribers === 'function') {
        results.subscriptionService = true;
      }

      
      if (this.notificationService && 
          typeof this.notificationService.commentNotification === 'function') {
        results.notificationService = true;
      }

      
      if (this.repo && typeof this.repo.create === 'function') {
        results.repository = true;
      }

      this.logger.log('Service test results:', results);
      return results;

    } catch (error) {
      this.logger.error('Service test failed:', error);
      return results;
    }
  }
}