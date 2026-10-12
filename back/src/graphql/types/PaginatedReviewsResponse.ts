import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Review } from 'src/review/entities/review.entity';

@ObjectType()
export class PaginatedReviewsResponse {
  @Field(() => [Review])
  data: Review[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}