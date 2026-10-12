import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RideService } from './ride.service';
import { RideState } from './entities/ride.entity';
import { Post, PostStatus } from 'src/post/entities/post.entity';
import { PostService } from 'src/post/post.service';
import { CreateRideInput } from './dto/create-ride.input';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';

@Injectable()
export class RideSchedulerService {
  private readonly logger = new Logger(RideSchedulerService.name);

  constructor(
    private readonly rideService: RideService,
    private readonly postService: PostService,
    private readonly subscriptionService:SubscriptionService,
    private readonly eventStreamService:EventStreamService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledRides() {
    const now = new Date();
    //this.logger.debug(`Checking rides at: ${now.toISOString()}`);

    let rides;
    try {
      rides = await this.rideService.findByState(RideState.NOT_STARTED);
      //this.logger.debug(`Found ${rides.length} NOT_STARTED rides`);
    } catch (error) {
      //this.logger.error('Failed to fetch NOT_STARTED rides', error.stack);
      return;
    }

    for (const ride of rides) {
      try {
        const rideDate = new Date(ride.date);
        const rideDateTime = new Date(`${rideDate.toISOString().split('T')[0]}T${ride.time}`);
        //this.logger.debug(`Ride ${ride.id} scheduled for ${rideDateTime.toISOString()}`);

        if (rideDateTime <= now) {
          //this.logger.log(`Ride ${ride.id} is due. Marking as STARTED.`);

          ride.state = RideState.STARTED;
          await this.rideService.update(ride.id, ride);
          const Ridesubscribers = await this.subscriptionService.getSubscribers(ride.id, 'ride');
          
          for (const recipientId of Ridesubscribers) {
              const event = {
                type: EventType.RIDE_START,
                targetId: ride.id,
                recipientId,
                payload: {
                  rideId: ride.id,
                  userId: recipientId,
                  timestamp: new Date().toISOString(),
                },
              };
              //this.logger.log(`Emitting event: ${JSON.stringify(event)}`);
            this.eventStreamService.emitEvent(event);
            //this.logger.log(`Emitted event: ${JSON.stringify(event)}`);
            }
          const post = ride.post as Post;
          if (!post) {
            //this.logger.warn(`Ride ${ride.id} has no associated post.`);
            continue;
          }

          if ((post.frequency !== 'One-time')&&(post.frequency !== 'Once')&&(post.status!=PostStatus.CLOSED)) {
            //this.logger.debug(`Post ${post.id} has frequency ${post.frequency}. Creating next ride.`);

            const nextDate = this.calculateNextDate(ride.date, post.frequency);
            const { appUserRides, ...rideWithoutPassengers } = ride;

            const newRideInput: CreateRideInput = {
              ...rideWithoutPassengers,
              date: nextDate,
              time: ride.post?.time, 
              state: RideState.NOT_STARTED,
            };


          

            delete (newRideInput as any)['id']; 

            await this.rideService.createRide(newRideInput, post);
            //this.logger.log(`Next ride created for Post ${post.id} on ${nextDate.toISOString()}`);

            post.date = nextDate;
            await this.postService.update(post.id, post);

            const subscribers = await this.subscriptionService.getSubscribers(post.id, 'post');
  
            for (const recipientId of subscribers) {
              
                const event = {
                  type: EventType.POST_UPDATED,
                  targetId: post.id,
                  recipientId,
                  payload: {
                    post,
                    timestamp: new Date().toISOString(),
                  },
                };
                //this.logger.log(`Emitting event: ${JSON.stringify(event)}`);
              this.eventStreamService.emitEvent(event);
              //this.logger.log(`Emitted event: ${JSON.stringify(event)}`);
              
            }

            //this.logger.debug(`Post ${post.id} updated with new date ${nextDate.toISOString()}`);
          }
          else{
            this.postService.close(post.id);
          }
        } else {
          //this.logger.debug(`Ride ${ride.id} is not yet due.`);
        }
      } catch (error) {
        //this.logger.error(`Error processing ride ${ride.id}: ${error.message}`, error.stack);
      }
    }
  }

  private calculateNextDate(currentDate: Date, frequency: string): Date {
    const baseDate = new Date(currentDate); 
    const next = new Date(baseDate);
  
    switch (frequency) {
      case 'Daily':
        next.setDate(next.getDate() + 1);
        break;
  
      case 'Weekly':
        next.setDate(next.getDate() + 7);
        break;
  
      case 'Biweekly':
        next.setDate(next.getDate() + 14);
        break;
  
      case 'Monthly':
        next.setMonth(next.getMonth() + 1);
        break;
  
      case 'Weekdays': {
        do {
          next.setDate(next.getDate() + 1);
        } while (next.getDay() === 0 || next.getDay() === 6); // skip Sunday (0) and Saturday (6)
        break;
      }
  
      default:
        //this.logger.warn(`Unsupported frequency "${frequency}". Using original date.`);
        break;
    }
  
    return next;
  }
  
}  