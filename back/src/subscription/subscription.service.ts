import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async subscribe(
    subscriberId: number, 
    targetId: number, 
    targetType: string
  ): Promise<void> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { subscriberId, targetId, targetType },
    });

    if (!existingSubscription) {
      await this.subscriptionRepository.save({
        subscriberId,
        targetId,
        targetType,
      });
      this.logger.log(`User ${subscriberId} subscribed to ${targetType}:${targetId}`);
    }
  }

  async unsubscribe(
    subscriberId: number, 
    targetId: number, 
    targetType: string
  ): Promise<void> {
    await this.subscriptionRepository.delete({
      subscriberId,
      targetId,
      targetType,
    });
    this.logger.log(`User ${subscriberId} unsubscribed from ${targetType}:${targetId}`);
  }

  async getSubscribers(
    targetId: number, 
    targetType: string
  ): Promise<number[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { targetId, targetType },
      select: ['subscriberId'],
    });
    
    return subscriptions.map(sub => sub.subscriberId);
  }

  async getUserSubscriptions(
    subscriberId: number, 
    targetType: string
  ): Promise<number[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { subscriberId, targetType },
      select: ['targetId'],
    });
    
    return subscriptions.map(sub => sub.targetId);
  }

  async isSubscribed(
    subscriberId: number, 
    targetId: number, 
    targetType: string
  ): Promise<boolean> {
    const count = await this.subscriptionRepository.count({
      where: { subscriberId, targetId, targetType },
    });
    
    return count > 0;
  }
}