import { InputType, Field, Int, PartialType, GraphQLISODateTime } from '@nestjs/graphql';
import { CreateRideInput } from './create-ride.input';
import { RideState } from '../entities/ride.entity';
@InputType()
export class UpdateRideInput extends PartialType(CreateRideInput) {
  @Field(() => GraphQLISODateTime, { nullable: true })
  date?: Date;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  departure?: string;

  @Field({ nullable: true })
  arrival?: string;

  @Field({ nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  nbPassengers?: number;

  @Field({ nullable: true })
  state?: RideState;
}