import { Resolver, Query, Args, Mutation, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { Ride, RideState } from './entities/ride.entity';
import { RideService } from './ride.service';
import { CreateRideInput } from './dto/create-ride.input';
import { UpdateRideInput } from './dto/update-ride.input';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';
import { CurrentUser } from 'src/auth/user.decorator';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { PostService } from 'src/post/post.service';
import { PaginationResult } from 'src/services/paginationService';
import { RidePaginationResult } from './dto/ride-pagination-result';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { AppUserWithRole} from 'src/graphql/types/AppUserWithRole';
import { Roles } from 'src/auth/role.decorator';


@UseGuards(GqlAuthGuard)
@Roles('user') 
@Resolver(() => Ride)
export class RideResolver {
  
    private readonly logger = new Logger('EventEmitter');
  constructor(private readonly rideService: RideService,private readonly postrepo :PostService,
        private readonly subscriptionService :SubscriptionService,
      private readonly eventStreamService:EventStreamService,
  ) {}

  @Query(() => [Ride], { name: 'getAllRides' })
  async findAll(): Promise<Ride[]> {
    const rides = await this.rideService.findAll();
    return rides.map(ride => ({
      ...ride,
      date: ride.date instanceof Date ? ride.date : new Date(ride.date)
    }));
  }

  @Query(() => Ride, { name: 'getRideById' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<Ride> {
    const ride = await this.rideService.findOne(+id);
    if (!ride) {
throw new Error('Ride not found'); 
}
    return {
      ...ride,
      date: ride?.date instanceof Date ? ride.date : new Date(ride?.date)
    };
  }

  @Query(() => [Ride])
  async getCommonRides(
      @Args('userId1', { type: () => Int }) userId1: number,
      @Args('userId2', { type: () => Int }) userId2: number,
  ): Promise<Ride[]> {
    return this.rideService.findCommonRides(userId1, userId2);
  }


  @Mutation(() => Ride)
  async createRide(
    @Args('createRideInput') createRideInput: CreateRideInput,
    @Args('postId') postId: number,  
  ): Promise<Ride> {
    if (createRideInput.date && typeof createRideInput.date === 'string') {
      createRideInput.date = new Date(createRideInput.date);
    }
    const post = await this.postrepo.findOne(postId);
  
    if (!post) {
      throw new Error('Post not found');
    }
    const ride = await this.rideService.createRide(createRideInput, post);
  
    return ride;
  }
  
  
  
  

  @Mutation(() => Ride)
  async updateRide(
    @Args('id', { type: () => String }) id: string,
    @Args('updateRideInput') updateRideInput: UpdateRideInput
  ): Promise<Ride> {
    if (updateRideInput.date && typeof updateRideInput.date === 'string') {
      updateRideInput.date = new Date(updateRideInput.date);
    }
    
    return this.rideService.update(+id, updateRideInput);
  }

  @Mutation(() => Boolean)
  async removeRide(@Args('id', { type: () => String }) id: String): Promise<boolean> {
    try {
      await this.rideService.remove(+id);
        const subscribers = await this.subscriptionService.getSubscribers(+id, 'ride');
          
          for (const recipientId of subscribers) {
              const event = {
                type: EventType.RIDE_DELETE,
                targetId: +id,
                recipientId,
                payload: {
                  rideId: +id,
                  userId: recipientId,
                  timestamp: new Date().toISOString(),
                },
              };
              this.logger.log(`Emitting event: ${JSON.stringify(event)}`);
            this.eventStreamService.emitEvent(event);
            this.logger.log(`Emitted event: ${JSON.stringify(event)}`);
          }
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
    
  }
  @Mutation(() => Ride)
  async closeRide(
    @Args('rideId',{ type: () => Int }) rideId: number,
    @CurrentUser() user: AppUser
  ): Promise<Ride> {
    return this.rideService.closeRide(rideId, user.id);
  }

  @Query(() => [Ride], { name: 'getRidesByState' })
  async findByState(@Args('state', { type: () => String }) state: RideState): Promise<Ride[]> {
    const rides = await this.rideService.findByState(state);

    return rides.map(ride => ({
      ...ride,
      date: ride.date instanceof Date ? ride.date : new Date(ride.date)
    }));
  }

  @Query(() => [Ride], { name: 'getRidesByDateRange' })
  async findByDateRange(
    @Args('startDate', { type: () => GraphQLISODateTime }) startDate: Date,
    @Args('endDate', { type: () => GraphQLISODateTime }) endDate: Date
  ): Promise<Ride[]> {
    const rides = await this.rideService.findByDateRange(startDate, endDate);

    return rides.map(ride => ({
      ...ride,
      date: ride.date instanceof Date ? ride.date : new Date(ride.date)
    }));
  }
  
@Query(() => [Ride], { name: 'getRidesByDriver' })
@UseGuards(GqlAuthGuard)
async getRidesByDriver(@CurrentUser() user: AppUser): Promise<Ride[]> {
  const rides = await this.rideService.findByDriver(user.id);
  return rides;}

@Query(() => RidePaginationResult, { name: 'getRidesPaginatedByDriver' })
@UseGuards(GqlAuthGuard)
async getRidesPaginatedByDriver(
  @CurrentUser() user: AppUser,
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  @Args('id', { type: () => Int, nullable: true }) id?: number,
): Promise<PaginationResult<Ride>> {
  const driverId = id ?? user.id;
  const result = await this.rideService.findPaginatedByDriver(driverId, page, limit);

  result.data = result.data.map(ride => ({
    ...ride,
    date: ride.date instanceof Date ? ride.date : new Date(ride.date),
  }));

  return result;
}

@Query(() => RidePaginationResult, { name: 'getRidesPaginatedByPassenger' })
@UseGuards(GqlAuthGuard)
async getRidesPaginatedByPassenger(
  @CurrentUser() user: AppUser,
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  @Args('id', { type: () => Int, nullable: true }) id?: number,
): Promise<PaginationResult<Ride>> {
  const riderId = id ?? user.id;
  const result = await this.rideService.findPaginatedByPassenger(riderId, page, limit);

  result.data = result.data.map(ride => ({
    ...ride,
    date: ride.date instanceof Date ? ride.date : new Date(ride.date),
  }));

  return result;
}

@Query(() => [Ride], { name: 'getRidesByUserId' })
@UseGuards(GqlAuthGuard)
async getRidesByUserId(@CurrentUser() user: AppUser): Promise<Ride[]> {
  console.log("inside getRidesByUserId resolver")
  const rides = await this.rideService.findByUserId(user.id);
  console.log(rides)
  return rides;
}
class="fc-event-title fc-sticky"

@Query(() => [Ride], { name: 'getRidesByPassenger' })
@UseGuards(GqlAuthGuard)
async getRidesByPassenger(@CurrentUser() user: AppUser): Promise<Ride[]> {
  console.log("inside getRidesByPassenger resolver")
  console.log(user.id)
  const rides = await this.rideService.findByPassenger(user.id);
  return rides;
}


@Query(() => [AppUserWithRole], { name: 'getUsersForRide' })
async getUsersForRide(
  @Args('rideId', { type: () => Int }) rideId: number,
): Promise<AppUserWithRole[]> {
  this.logger.log(`Getting users for ride: ${rideId}`);

  try {
    const users = await this.rideService.getUsersForRide(rideId);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    for (const user of users) {
      if (user.imageUrl) {
        user.imageUrl = `${baseUrl}${user.imageUrl}`;
      }
    }

    return users;
  } catch (error) {
    this.logger.error(`Error getting users for ride: ${error.message}`);
    throw error;
  }
}


@Query(() => RidePaginationResult, { name: 'searchRidesByUser' })
@UseGuards(GqlAuthGuard)
async searchRidesByUser(
  @CurrentUser() user: AppUser,
  @Args('searchTerm', { type: () => String }) searchTerm: string,
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  @Args('filterType', { type: () => String, nullable: true }) filterType?: string,
): Promise<PaginationResult<Ride>> {
  const result = await this.rideService.searchRidesByUser(user.id, searchTerm, page, limit, filterType);

  result.data = result.data.map(ride => ({
    ...ride,
    date: ride.date instanceof Date ? ride.date : new Date(ride.date),
  }));

  return result;
}

}

