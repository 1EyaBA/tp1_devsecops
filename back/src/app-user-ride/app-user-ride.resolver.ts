import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { AppUserRideService } from './app-user-ride.service';

@Resolver()
export class AppUserRideResolver {
  constructor(private readonly appUserRideService: AppUserRideService) {}

  @Query(() => Boolean)
  async isUserInRide(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('rideId', { type: () => Int }) rideId: number,
  ): Promise<boolean> {
    return this.appUserRideService.exists(userId, rideId);
  }
}
