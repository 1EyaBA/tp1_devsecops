import { ObjectType, Int, Field } from '@nestjs/graphql';
import { Review } from '../entities/review.entity';

@ObjectType()
export class ReviewPaginationResult {
  @Field(() => [Review])
  data: Review[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}