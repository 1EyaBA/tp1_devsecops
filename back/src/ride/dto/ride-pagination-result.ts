import { ObjectType, Int, Field } from '@nestjs/graphql';
import { Ride } from '../entities/ride.entity';

@ObjectType()
export class RidePaginationResult {
  @Field(() => [Ride])
  data: Ride[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}
