
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { SubscriptionService } from 'src/subscription/subscription.service';
interface EventData {
  type: EventType;
  targetId: number;
  recipientId?: number;
  payload: any;
}


interface SSEConnection {
  userId: number;
  response: Response;
  lastActivity: Date;
}

export enum EventType {
  POST_UPDATED = 'POST_UPDATED',
  NEW_COMMENT = 'NEW_COMMENT',
  JOIN_REQUEST = 'JOIN_REQUEST',
  JOIN_ACCEPT = 'JOIN_ACCEPT',
  RIDE_DELETE = 'RIDE_DELETE',
  RIDE_START = 'RIDE_START',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REPORT_ADDED = 'REPORT_ADDED',//to add felfront
  MESSAGE = 'MESSAGE',
}


@Injectable()
export class SseSubscriptionService {
  private readonly logger = new Logger(SseSubscriptionService.name);
  private connections = new Map<number, SSEConnection>();

  
  


  subscribe(userId: number, response: Response): () => void {
    const connection: SSEConnection = {
      userId,
      response,
      lastActivity: new Date(),
    };

    this.connections.set(userId, connection);
    this.logger.log(`User ${userId} subscribed to SSE events`);

    
    return () => {
      this.connections.delete(userId);
      this.logger.log(`User ${userId} unsubscribed from SSE events`);
    };
  }

  async sendEventToUser(userId: number, eventData: EventData): Promise<boolean> {
    const connection = this.connections.get(userId);
    
    if (!connection) {
      this.logger.debug(`No active connection for user ${userId}`);
      return false;
    }

    try {
      const { response } = connection;
      
      if (response.writableEnded) {
        this.connections.delete(userId);
        return false;
      }

      const eventPayload = {
        ...eventData.payload,
        type: eventData.type,
        timestamp: new Date().toISOString(),
      };

      response.write(`data: ${JSON.stringify(eventPayload)}\n\n`);
      connection.lastActivity = new Date();
      
      this.logger.debug(`Event sent to user ${userId}: ${eventData.type}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send event to user ${userId}:`, error);
      this.connections.delete(userId);
      return false;
    }
  }

 
  async sendEventToUsers(userIds: number[], eventData: EventData): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendEventToUser(userId, eventData)
    );
    
    await Promise.all(promises);
  }


  getActiveConnections(): number[] {
    return Array.from(this.connections.keys());
  }

 
  cleanupStaleConnections(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [userId, connection] of this.connections.entries()) {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceLastActivity > staleThreshold || connection.response.writableEnded) {
        this.connections.delete(userId);
        this.logger.log(`Cleaned up stale connection for user ${userId}`);
      }
    }
  }
}

@Injectable()
export class EventStreamService {
  private readonly logger = new Logger(EventStreamService.name);

  constructor(
    private readonly sseSubscriptionService: SseSubscriptionService,
    private readonly subscriptionService: SubscriptionService
  ) {
    // Clean up stale connections every 5 minutes
    setInterval(() => {
      this.sseSubscriptionService.cleanupStaleConnections();
    }, 5 * 60 * 1000);
  }

  async subscribeToEvent(
    userId: number,
    response: Response
  ): Promise<() => void> {
    return this.sseSubscriptionService.subscribe(userId, response);
  }

  async emitEvent(eventData: EventData): Promise<void> {
    if (eventData.recipientId) {
      await this.sseSubscriptionService.sendEventToUser(
        eventData.recipientId,
        eventData
      );
    }
  }

 
  async emitEventToSubscribers(
    type: EventType,
    targetId: number,
    targetType: string,
    payload: any,
  ): Promise<void> {
  
    const subscribers = await this.getSubscribers(targetId, targetType);
    
    const eventData: EventData = {
      type,
      targetId,
      payload,
    };

    await this.sseSubscriptionService.sendEventToUsers(subscribers, eventData);
  }

 
  async getSubscribers(targetId: number, targetType: string): Promise<number[]> {

    
    return this.subscriptionService.getSubscribers(targetId, targetType);
    
    
  }
}

