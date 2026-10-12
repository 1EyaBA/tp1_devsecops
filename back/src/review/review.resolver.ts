import { Resolver, Query, Args, Int, Info } from '@nestjs/graphql';
import { ReviewFormData, UserInfo, RideDetails, ReviewItem} from '../graphql/types/review-form-data.model'; 
import { AppUserService } from 'src/app-user/app-user.service';
import { RideService } from '../ride/ride.service';
import { CurrentUser } from 'src/auth/user.decorator';
import { AppUser } from 'src/app-user/entities/app-user.entity';
import { ReviewService } from './review.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';
import { Review } from './entities/review.entity';
import { PaginationResult } from 'src/services/paginationService';
import { PaginatedReviewsResponse } from 'src/graphql/types/PaginatedReviewsResponse';
import { GraphQLInt } from 'graphql';
import { ReviewPaginationResult } from './dto/ReviewPaginationResult';
import { Roles } from 'src/auth/role.decorator';

@UseGuards(GqlAuthGuard)
@Resolver()
@Roles('user') 
export class ReviewResolver {
  constructor(
    private userService: AppUserService,
    private rideService: RideService,
    private reviewService: ReviewService
  ) {}



  

 @Query(() => ReviewFormData)
  async reviewFormData(
    @Args('rideId', { type: () => Int }) rideId: number,
    @Args('reviewedUserId', { type: () => Int }) reviewedUserId: number
  ): Promise<ReviewFormData> {
    console.log('rideId:', rideId);
    console.log('reviewedUserId:', reviewedUserId);
    const user = (await this.userService.findByIds([reviewedUserId]))[0];
    console.log(user);
    const ride = (await this.rideService.findByIds([rideId]))[0];
    console.log(ride);
    if (!user || !ride) {
      throw new Error('User or ride not found');
    }
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      reviewedUser: {
        id: user.id,
        name: user.name,
        imageUrl:`${baseUrl}${user.imageUrl}`,
        
        
      },
      ride: {
        id: ride.id,
        departure: ride.departure,
        date: new Date(ride.date).toISOString().split('T')[0],
        arrival: ride.arrival,
        price: ride.price,
        time: ride.time,
      },
    };
  }

  @Query(() => PaginatedReviewsResponse, { name: 'getMyReviews' })
  async getMyReviews(
    @CurrentUser() user: AppUser,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 6 }) limit: number
  ): Promise<PaginationResult<Review>> {
    return this.reviewService.findByReviewerId(user.id, page, limit);
  }
  @Query(() => PaginatedReviewsResponse, { name: 'getUserReviews' })
async getUserReviews(
  @Args('userId', { type: () => Int }) userId: number,
  @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, nullable: true, defaultValue: 6 }) limit: number
): Promise<PaginationResult<Review>> {
  const result = await this.reviewService.findByReviewedUserId(userId, page, limit);

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  for (const review of result.data) {
    if (review.reviewer?.imageUrl) {
      review.reviewer.imageUrl = `${baseUrl}${review.reviewer.imageUrl}`;
    }
    if (review.reviewedUser?.imageUrl) {
      review.reviewedUser.imageUrl = `${baseUrl}${review.reviewedUser.imageUrl}`;
    }
  }

  return result;
}


  @Query(() => GraphQLInt, { name: 'getAverageRating' })
  getAverageRating(@CurrentUser() user: AppUser): Promise<number | null> {
    return this.reviewService.getAverageRating(user.id);
  }

  @Query(() => GraphQLInt, { name: 'getAverageRatingById' })
  getAverageRatingById(@Args('id', { type: () => Int }) id: number): Promise<number | null> {
    return this.reviewService.getAverageRating(id);
  }

  @Query(() => ReviewPaginationResult, { name: 'getPaginatedMyReviews' }) 
  async getPaginatedReviews(
    @CurrentUser() user: AppUser,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @Args('sortField', { nullable: true, defaultValue: 'createdAt' }) sortField: string,
    @Args('sortOrder', { nullable: true, defaultValue: 'DESC' }) sortOrder: 'ASC' | 'DESC',
  ): Promise<PaginationResult<Review>> {
    return this.reviewService.findPaginatedByReviewedUserId(user.id, page, limit, sortField, sortOrder);
  }
  
  @Query(() => PaginatedReviewsResponse, { name: 'searchMyReviews' })
  async searchMyReviews(
    @CurrentUser() user: AppUser,
   @Args('searchTerm', { type: () => String }) searchTerm: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 6 }) limit: number,
    @Args('isMyReviews', { type: () => Boolean, nullable: true, defaultValue: true }) isMyReviews: boolean
  ): Promise<PaginationResult<Review>> {
    console.log("in the search function back");
    console.log("Search params:", { userId: user.id, searchTerm, page, limit, isMyReviews }); // Added logging
    return this.reviewService.searchReviews(user.id, searchTerm, page, limit, isMyReviews);
  }

}
