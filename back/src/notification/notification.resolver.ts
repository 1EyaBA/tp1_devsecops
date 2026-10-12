import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';

@ObjectType()
class MarkAllAsReadResponse {
  @Field(() => Int)
  count: number;
}

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation(() => Notification)
  createNotification(
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput
  ) {
    return this.notificationService.create(createNotificationInput);
  }

  @Query(() => [Notification], { name: 'allNotifications' })
  findAllNotifications() {
    return this.notificationService.findAll();
  }

  // Updated to match frontend query - supports userId, limit, and offset
  @Query(() => [Notification], { name: 'notifications' })
  findUserNotifications(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.notificationService.findByUserId(userId, limit);
  }

  @Query(() => [Notification], { name: 'unreadNotifications' })
  findUnreadNotifications(
    @Args('userId', { type: () => Int }) userId: number
  ) {
    return this.notificationService.findUnreadByUserId(userId);
  }

  // Fixed query name to match frontend
  @Query(() => Int, { name: 'unreadNotificationsCount' })
  getUnreadCount(
    @Args('userId', { type: () => Int }) userId: number
  ) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Query(() => Notification, { name: 'notification' })
  findOneNotification(@Args('id', { type: () => Int }) id: number) {
    return this.notificationService.findOne(id);
  }

  @Mutation(() => Notification)
  updateNotification(
    @Args('updateNotificationInput') updateNotificationInput: UpdateNotificationInput
  ) {
    return this.notificationService.update(
      updateNotificationInput.id, 
      updateNotificationInput
    );
  }

  // Fixed mutation name to match frontend
  @Mutation(() => Notification)
  markNotificationRead(@Args('notificationId', { type: () => Int }) notificationId: number) {
    return this.notificationService.markAsRead(notificationId);
  }

  // Fixed mutation name to match frontend
  @Mutation(() => MarkAllAsReadResponse)
  async markAllNotificationsRead(
    @Args('userId', { type: () => Int }) userId: number
  ) {
    const count = await this.notificationService.markAllAsRead(userId);
    return { count };
  }

  // Fixed mutation name to match frontend
  @Mutation(() => Notification)
  deleteNotification(@Args('notificationId', { type: () => Int }) notificationId: number) {
    return this.notificationService.remove(notificationId);
  }
}