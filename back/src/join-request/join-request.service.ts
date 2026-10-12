import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { UpdateJoinRequestDto } from './dto/update-join-request.dto';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { Ride } from 'src/ride/entities/ride.entity';
import { JoinRequest } from './entities/join-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class JoinRequestService {
  private readonly logger = new Logger(JoinRequestService.name);

  constructor(
    @InjectRepository(JoinRequest) private readonly repo: Repository<JoinRequest>,
    private readonly subscriptionService: SubscriptionService,
    private readonly notificationService: NotificationService,
    private readonly eventStreamService: EventStreamService,
  ) {}

  async create(data: { user: AppUser; ride: Ride }, postId: number): Promise<JoinRequest> {
    this.logger.log(`=== STARTING JOIN REQUEST CREATION ===`);
    this.logger.log(`Post ID: ${postId}`);
    this.logger.log(`User:`, JSON.stringify({ id: data?.user?.id, name: data?.user?.name }, null, 2));
    this.logger.log(`Ride:`, JSON.stringify({ id: data?.ride?.id, driverId: data?.ride?.driver?.id }, null, 2));
    
    try {
      // Enhanced validation
      if (!data) {
        throw new Error('Data object is null or undefined');
      }
      
      if (!data.user) {
        throw new Error('User data is null or undefined');
      }
      
      if (!data.ride) {
        throw new Error('Ride data is null or undefined');
      }
      
      if (!postId || postId <= 0) {
        throw new Error('Invalid postId provided');
      }
      
      if (!data.user.id || data.user.id <= 0) {
        throw new Error('Invalid user ID');
      }
      
      if (!data.ride.id || data.ride.id <= 0) {
        throw new Error('Invalid ride ID');
      }

      this.logger.log(`Input validation passed`);

      // Check for existing join request
      this.logger.log(`Checking for existing join request`);
      const existingRequest = await this.repo.findOne({
        where: {
          user: { id: data.user.id },
          ride: { id: data.ride.id }
        }
      });

      if (existingRequest) {
        this.logger.warn(`Join request already exists for user ${data.user.id} and ride ${data.ride.id}`);
        throw new Error('Join request already exists for this user and ride');
      }

      this.logger.log(`No existing join request found`);

      // Create and save join request
      this.logger.log(`Creating join request entity`);
      const joinRequest = this.repo.create({
        user: data.user,
        ride: data.ride,
        date: new Date(),
      });

      this.logger.log(`Saving join request to database`);
      const savedJoinRequest = await this.repo.save(joinRequest);
      this.logger.log(`Join request saved successfully with ID: ${savedJoinRequest.id}`);

      // Get full join request with relations
      const fullJoinRequest = await this.repo.findOne({
        where: { id: savedJoinRequest.id },
        relations: ['user', 'ride', 'ride.driver'], // Make sure to load the driver relationship
      });

      if (!fullJoinRequest) {
        throw new Error('Join request not found after creation');
      }

      this.logger.log(`Full join request loaded:`, {
        id: fullJoinRequest.id,
        userId: fullJoinRequest.user?.id,
        rideId: fullJoinRequest.ride?.id,
        driverId: fullJoinRequest.ride?.driver?.id
      });

      // Subscribe user to ride
      this.logger.log(`Subscribing user ${data.user.id} to ride ${data.ride.id}`);
      try {
        await this.subscriptionService.subscribe(
          data.user.id,  // subscriberId
          data.ride.id,  // targetId  
          'ride'         // targetType
        );
        this.logger.log(`Subscription to ride successful`);
      } catch (subscriptionError) {
        this.logger.error(`Ride subscription failed:`, subscriptionError);
        // Don't throw here - join request is already created, continue with notifications
      }

      // Get post subscribers
      this.logger.log(`Getting subscribers for post ${postId}`);
      let postSubscribers: number[] = [];
      try {
        postSubscribers = await this.subscriptionService.getSubscribers(postId, 'post');
        this.logger.log(`Found ${postSubscribers.length} post subscribers: [${postSubscribers.join(', ')}]`);
      } catch (subscribersError) {
        this.logger.error(`Failed to get post subscribers:`, subscribersError);
        // Continue without post notifications
      }

      // Determine recipients to notify
      const rideOwnerId = fullJoinRequest.ride.driver?.id;
      const recipientsToNotify = new Set<number>();

      // Add ride owner (driver)
      if (rideOwnerId && rideOwnerId !== data.user.id) {
        recipientsToNotify.add(rideOwnerId);
        this.logger.log(`Added ride owner ${rideOwnerId} to notification list`);
      } else {
        this.logger.log(`Ride owner not found or is the same as requester`);
      }

      // Add post subscribers (excluding the requester)
      postSubscribers
        .filter(recipientId => recipientId !== data.user.id)
        .forEach(recipientId => recipientsToNotify.add(recipientId));

      const finalRecipients = Array.from(recipientsToNotify);
      this.logger.log(`Will notify ${finalRecipients.length} recipients: [${finalRecipients.join(', ')}]`);

      if (finalRecipients.length === 0) {
        this.logger.log(`No recipients to notify - returning join request`);
        return fullJoinRequest;
      }

      // Send notifications
      this.logger.log(`Creating ${finalRecipients.length} notifications`);
      const notificationPromises = finalRecipients.map(async (recipientId, index) => {
        this.logger.log(`Creating notification ${index + 1}/${finalRecipients.length} for user ${recipientId}`);
        try {
          // Fixed notification method call with correct parameter order
          const notification = await this.notificationService.JoinRequestNotification(
            recipientId,              // userId (recipient)
            data.user.id,             // driverId (the requester) 
            fullJoinRequest.ride.id,  // id (ride id)
            'New Join Request',       // title
            `${data.user.name || 'Someone'} has requested to join your ride`, // message
            `/posts`,        // actionUrl
            {
              joinRequestId: fullJoinRequest.id,
              rideId: fullJoinRequest.ride.id,
              requesterId: data.user.id,
              requesterName: data.user.name || 'Anonymous',
              postId: postId
            }
          );
          this.logger.log(`Notification created successfully for user ${recipientId} - ID: ${notification?.id}`);
          return notification;
        } catch (notificationError) {
          this.logger.error(`Notification failed for user ${recipientId}:`, notificationError);
          throw notificationError;
        }
      });

      this.logger.log(`Waiting for all notifications to complete`);
      const results = await Promise.allSettled(notificationPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      this.logger.log(`Notification results - Success: ${successful}, Failed: ${failed}`);
      
      if (failed > 0) {
        const failures = results
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .map(r => r.reason);
        this.logger.error(`Failed notifications:`, failures);
      }

      this.logger.log(`=== JOIN REQUEST CREATION COMPLETED SUCCESSFULLY ===`);
      this.logger.log(`Join Request ID: ${fullJoinRequest.id}, Notifications sent: ${successful}/${finalRecipients.length}`);
      
      return fullJoinRequest;

    } catch (error) {
      this.logger.error(`=== JOIN REQUEST CREATION FAILED ===`);
      this.logger.error(`Error:`, error);
      this.logger.error(`Stack:`, error.stack);
      throw error;
    }
  }

  async deleteByUserAndRide(userId: number, rideId: number, postId: number): Promise<boolean> {
    this.logger.log(`=== STARTING JOIN REQUEST DELETION ===`);
    this.logger.log(`User ID: ${userId}, Ride ID: ${rideId}, Post ID: ${postId}`);
    
    try {
      // Validate inputs
      if (!userId || userId <= 0) {
        throw new Error('Invalid userId provided');
      }
      
      if (!rideId || rideId <= 0) {
        throw new Error('Invalid rideId provided');
      }
      
      if (!postId || postId <= 0) {
        throw new Error('Invalid postId provided');
      }

      this.logger.log(`Finding join request before deletion`);
      const joinRequest = await this.repo.findOne({
        where: { user: { id: userId }, ride: { id: rideId } },
        relations: ['user', 'ride']
      });

      if (!joinRequest) {
        this.logger.warn(`Join request not found for user ${userId} and ride ${rideId}`);
        return false;
      }

      this.logger.log(`Found join request with ID: ${joinRequest.id}`);

      const result = await this.repo.delete({ user: { id: userId }, ride: { id: rideId } });
      const deleted = (result.affected ?? 0) > 0;

      if (!deleted) {
        this.logger.error(`Failed to delete join request`);
        return false;
      }

      this.logger.log(`Join request deleted successfully`);

      // Get post subscribers for notifications
      let postSubscribers: number[] = [];
      try {
        postSubscribers = await this.subscriptionService.getSubscribers(postId, 'post');
        this.logger.log(`Found ${postSubscribers.length} post subscribers`);
      } catch (subscribersError) {
        this.logger.error(`Failed to get subscribers:`, subscribersError);
        // Return true since deletion was successful, notifications are secondary
        return true;
      }

      const recipientsToNotify = postSubscribers.filter(recipientId => recipientId !== userId);
      
      if (recipientsToNotify.length === 0) {
        this.logger.log(`No recipients to notify - deletion completed`);
        return true;
      }

      // Send deletion notifications
      this.logger.log(`Creating ${recipientsToNotify.length} deletion notifications`);
      const notificationPromises = recipientsToNotify.map(async (recipientId, index) => {
        this.logger.log(`Creating deletion notification ${index + 1}/${recipientsToNotify.length} for user ${recipientId}`);
        try {
          const notification = await this.notificationService.JoinRequestNotification(
            recipientId,              // userId (recipient)
            userId,                   // driverId (the user who deleted)
            rideId,                   // id (ride id)
            'Join Request Cancelled', // title
            `${joinRequest.user.name || 'Someone'} cancelled their join request`, // message
            `/posts`,        // actionUrl
            {
              joinRequestId: joinRequest.id,
              rideId: rideId,
              requesterId: userId,
              requesterName: joinRequest.user.name || 'Anonymous',
              postId: postId,
              action: 'cancelled'
            }
          );
          this.logger.log(`Deletion notification created successfully for user ${recipientId}`);
          return notification;
        } catch (notificationError) {
          this.logger.error(`Deletion notification failed for user ${recipientId}:`, notificationError);
          throw notificationError;
        }
      });

      const results = await Promise.allSettled(notificationPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      this.logger.log(`Deletion notification results - Success: ${successful}, Failed: ${failed}`);

      this.logger.log(`=== JOIN REQUEST DELETION COMPLETED ===`);
      return true;

    } catch (error) {
      this.logger.error(`=== JOIN REQUEST DELETION FAILED ===`);
      this.logger.error(`Error:`, error);
      throw error;
    }
  }

  // Keep your existing methods unchanged
  async findOne(id: number): Promise<JoinRequest> {
    const joinRequest = await this.repo.findOne({ where: { id }, relations: ['user', 'ride'] });
    if (!joinRequest) {
      throw new NotFoundException(`JoinRequest with id ${id} not found`);
    }
    return joinRequest;
  }

  async findAll(): Promise<JoinRequest[]> {
    return this.repo.find({ relations: ['user', 'ride'] });
  }

  async findByRideId(rideId: number): Promise<JoinRequest[]> {
    return this.repo.find({ where: { ride: { id: rideId } }, relations: ['user'] });
  }

  async findByRideUser(rideId: number, userId: number): Promise<JoinRequest[]> {
    return this.repo.find({
      where: {
        ride: { id: rideId },
        user: { id: userId },
      },
      relations: ['user', 'ride']
    });
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result?.affected && result.affected > 0;
  }

  async testServices(): Promise<any> {
    this.logger.log('=== TESTING JOIN REQUEST SERVICES ===');
    
    const results: any = {
      subscriptionService: false,
      notificationService: false,
      eventStreamService: false,
      repository: false,
    };

    try {
      if (this.subscriptionService && 
          typeof this.subscriptionService.subscribe === 'function' &&
          typeof this.subscriptionService.getSubscribers === 'function') {
        results.subscriptionService = true;
      }

      if (this.notificationService && 
          typeof this.notificationService.JoinRequestNotification === 'function') {
        results.notificationService = true;
      }

      if (this.eventStreamService && 
          typeof this.eventStreamService.emitEvent === 'function') {
        results.eventStreamService = true;
      }

      if (this.repo && typeof this.repo.create === 'function') {
        results.repository = true;
      }

      this.logger.log('Join Request Service test results:', results);
      return results;

    } catch (error) {
      this.logger.error('Join Request Service test failed:', error);
      return results;
    }
  }
}