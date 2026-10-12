import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { EventStreamService, EventType, SseSubscriptionService } from '../SSE/sse-subscription.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly eventStreamService: EventStreamService,
    
  ) {}

  async create(createNotificationInput: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationInput);
    const savedNotification = await this.notificationRepository.save(notification);

    // Send real-time notification via SSE
    await this.eventStreamService.emitEvent({
      type: createNotificationInput.type as EventType,
      targetId: savedNotification.relatedEntityId || 0,
      recipientId: savedNotification.userId,
      payload: {
        id: savedNotification.id,
        type: savedNotification.type,
        title: savedNotification.title,
        message: savedNotification.message,
        actionUrl: savedNotification.actionUrl,
        metadata: savedNotification.metadata,
      },
    });

    return savedNotification;
  }
  async messageNotification(
    userId: number,
    receiverId: number,
    chatId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const finalMetadata = {
    ...(metadata || {}),
    chatId, 
  };
    const notification = await this.create({
      userId: receiverId,
      type: EventType.MESSAGE,
      title,
      message,
      actionUrl,
      metadata: finalMetadata,
      relatedEntityId: userId,
      relatedEntityType: 'app-user',
       
    });
    console.log('Message notification created:', notification);

    return notification;
  }
  async RideNotification(
    userId: number,
    rideId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.RIDE_START,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: rideId,
      relatedEntityType: 'ride',
    });

    return notification;
  }
  async JoinRequestNotification(
userId: number, driverId: number, id: number, title: string, message: string, actionUrl?: string, metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.JOIN_REQUEST,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: driverId,
      relatedEntityType: 'app-user',
    });

    return notification;
  }
  async JoinAcceptNotification(
userId: number, driverId:number, id: number, title: string, message: string, actionUrl?: string, metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.JOIN_ACCEPT,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: driverId,
      relatedEntityType: 'app-user',
    });

    return notification;
  }
  async PostNotification(
    userId: number,
    postId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.POST_UPDATED,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: postId,
      relatedEntityType: 'post',
    });

    return notification;
  }
  async reportNotification(
    userId: number,
    reportId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.REPORT_ADDED,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: reportId,
      relatedEntityType: 'report',
    });

    return notification;
  }
  async reviewNotification(
    userId: number,
    reviewId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.REVIEW_ADDED,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId: reviewId,
      relatedEntityType: 'review',
    });

    return notification;
  }

  async commentNotification(
    userId: number,
    postId: number,
    commentId: number,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,

  ): Promise<Notification> {
    const notification = await this.create({
      userId,
      type: EventType.NEW_COMMENT,
      title,
      message,
      actionUrl,
      metadata: {
        ...metadata,
        postId,
        commentId,
      },
      relatedEntityId: postId,
      relatedEntityType: 'post',
    });

    return notification;
  }
  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number, limit = 50): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnreadByUserId(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { 
        userId, 
        status: NotificationStatus.UNREAD 
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { 
        userId, 
        status: NotificationStatus.UNREAD 
      },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: number, updateNotificationInput: UpdateNotificationInput): Promise<Notification> {
    const notification = await this.findOne(id);
    
    Object.assign(notification, updateNotificationInput);
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: number): Promise<Notification> {
    return await this.update(id, { 
      id, 
      status: NotificationStatus.READ 
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ }
    );
  }

  async remove(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
    return notification;
  }
/*
  // Helper methods for creating specific notification types
  async createAndSendNotification(
    userId: number,
    type: EventType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
    relatedEntityId?: number,
    relatedEntityType?: string,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      metadata,
      relatedEntityId,
      relatedEntityType,
    });
  }

  async sendNotificationToUser(
    recipientId: number,
    type: EventType,
    targetId: number,
    payload: any,
  ): Promise<void> {
    await this.eventStreamService.emitEvent({
      type,
      targetId,
      recipientId,
      payload,
    });
  }

  async sendNotificationToSubscribers(
    type: EventType,
    targetId: number,
    targetType: string,
    payload: any,
  ): Promise<void> {
    await this.eventStreamService.emitEventToSubscribers(
      type,
      targetId,
      targetType,
      payload,
    );
  }

  async notifyPostUpdated(postId: number, updaterId: number, postTitle: string): Promise<void> {
    const payload = {
      message: `"${postTitle}" has been updated`,
      postId,
      updaterId,
    };
    
    await this.sendNotificationToSubscribers(
      EventType.POST_UPDATED,
      postId,
      'post',
      payload,
    );
  }

  async notifyNewComment(
    postId: number,
    commentId: number,
    commenterId: number,
    commenterName: string,
    postTitle: string,
  ): Promise<void> {
    const payload = {
      message: `${commenterName} commented on "${postTitle}"`,
      postId,
      commentId,
      commenterId,
    };
    
    await this.sendNotificationToSubscribers(
      EventType.NEW_COMMENT,
      postId,
      'post',
      payload,
    );
  }
/*
  async notifyJoinRequest(
    groupId: number,
    requesterId: number,
    requesterName: string,
    groupName: string,
    groupOwnerId: number,
  ): Promise<void> {
    await this.createAndSendNotification(
      groupOwnerId,
      EventType.JOIN_REQUEST,
      'New Join Request',
      `${requesterName} wants to join "${groupName}"`,
      `/groups/${groupId}/requests`,
      { requesterId, groupId },
      groupId,
      'group',
    );
  }

  async notifyJoinAccepted(
    groupId: number,
    userId: number,
    groupName: string,
  ): Promise<void> {
    await this.createAndSendNotification(
      userId,
      EventType.JOIN_ACCEPT,
      'Join Request Accepted',
      `Your request to join "${groupName}" has been accepted!`,
      `/groups/${groupId}`,
      { groupId },
      groupId,
      'group',
    );
  }

  async notifyRideDeleted(
    rideId: number,
    rideName: string,
    participantIds: number[],
  ): Promise<void> {
    const promises = participantIds.map(userId =>
      this.createAndSendNotification(
        userId,
        EventType.RIDE_DELETE,
        'Ride Cancelled',
        `"${rideName}" has been cancelled`,
        `/rides`,
        { rideId },
        rideId,
        'ride',
      )
    );

    await Promise.all(promises);
  }

  async notifyRideStarted(
    rideId: number,
    rideName: string,
    participantIds: number[],
  ): Promise<void> {
    const promises = participantIds.map(userId =>
      this.createAndSendNotification(
        userId,
        EventType.RIDE_START,
        'Ride Started',
        `"${rideName}" is starting now!`,
        `/rides/${rideId}`,
        { rideId },
        rideId,
        'ride',
      )
    );

    await Promise.all(promises);
  }

  async notifyReviewAdded(
    reviewedUserId: number,
    reviewerId: number,
    reviewerName: string,
    rating: number,
  ): Promise<void> {
    await this.createAndSendNotification(
      reviewedUserId,
      EventType.REVIEW_ADDED,
      'New Review',
      `${reviewerName} left you a ${rating}-star review`,
      `/profile/reviews`,
      { reviewerId, rating },
      reviewedUserId,
      'user',
    );
  }*/
}