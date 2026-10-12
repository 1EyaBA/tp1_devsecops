import { Injectable, Logger } from '@nestjs/common';
import { CreateAppUserRideDto } from './dto/create-app-user-ride.dto';
import { UpdateAppUserRideDto } from './dto/update-app-user-ride.dto';
import { GenericService } from 'src/services/genericService';
import { AppUserRide} from './entities/app-user-ride.entity';
import { Role } from 'src/enums/role';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { Ride } from 'src/ride/entities/ride.entity';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';

@Injectable()
export class AppUserRideService extends GenericService{
  private readonly logger = new Logger('EventEmitter');
  constructor(
      
      @InjectRepository(AppUserRide)
      private readonly appUserRideRepository: Repository<AppUserRide>,
    private readonly subscriptionService :SubscriptionService,
  private readonly eventStreamService:EventStreamService,){super(appUserRideRepository);}

// app-user-ride.service.ts
async addPassenger(user: AppUser, ride: Ride): Promise<AppUserRide> {
  const exists = await this.appUserRideRepository.findOne({
    where: {
      appUser: { id: user.id },
      ride: { id: ride.id }
    }
  });

  if (exists) throw new Error('User already joined this ride');

  const entry = this.appUserRideRepository.create({
    appUser: user,
    ride,
  });
  await this.subscriptionService.subscribe(
    user.id,
    ride.id,
    'ride' // Entity type
  );
  const subscribers = await this.subscriptionService.getSubscribers(ride.id, 'ride');
    
    for (const recipientId of subscribers) {
        const event = {
          type: EventType.JOIN_ACCEPT,
          targetId: ride.id,
          recipientId,
          payload: {
            rideId: ride.id,
            userId: recipientId,
            timestamp: new Date().toISOString(),
          },
        };
        this.logger.log(`Emitting event: ${JSON.stringify(event)}`);
      this.eventStreamService.emitEvent(event);
      this.logger.log(`Emitted event: ${JSON.stringify(event)}`);

  

}
return this.appUserRideRepository.save(entry);}
async exists(userId: number, rideId: number): Promise<boolean> {
  const existing = await this.appUserRideRepository.findOne({
    where: {
      appUser: { id: userId },
      ride: { id: rideId },
    },
  });
  return !!existing;
}

}
