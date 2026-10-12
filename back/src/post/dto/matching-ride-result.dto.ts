import { ObjectType, Field } from '@nestjs/graphql';
import { Ride } from 'src/ride/entities/ride.entity';

@ObjectType()
export class MatchingRideResult {
  @Field(() => Ride, { nullable: true })
  ride: Ride | null;

  @Field(() => String, { nullable: true })
  postOwnerId: number | null;
}
