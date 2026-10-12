import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GenericService } from '../services/genericService';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { PaginationResult, PaginationService } from 'src/services/paginationService';
import { SearchService } from 'src/services/searchService';
import { AppUserService } from 'src/app-user/app-user.service';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { NotificationService } from 'src/notification/notification.service';
//import { ReviewPayload } from 'src/SSE/ReviewPayload';

@Injectable()
export class ReviewService extends GenericService {



     constructor(@InjectRepository(Review) private readonly reviewRepository: Repository<Review>,private readonly paginationService: PaginationService,private readonly searchService: SearchService,
        private readonly userService: AppUserService,
        private readonly notificationService:NotificationService
      ) {
        super(reviewRepository)
        
     }

     async findOne(id: number): Promise<Review> {
      //include the relations you need
      const review = await this.reviewRepository.findOne({ where: { id }, relations: ['reviewer', 'reviewedUser', 'ride'] });
      if (!review) {
        throw new Error('Review not found');
      }
      return review;
     }
     async createReview(createReviewDto: CreateReviewDto) {
      console.log('Creating review:', createReviewDto);
    
      const review = this.reviewRepository.create({
        stars: createReviewDto.stars,
        comment: createReviewDto.comment,
        date: new Date().toISOString().split('T')[0], // Set the current date
        reviewer: { id: createReviewDto.reviewerId },      
        reviewedUser: { id: createReviewDto.reviewedUserId },
        ride: { id: createReviewDto.rideId },               
      });
    
      const savedReview = await this.reviewRepository.save(review);
    
    
      await this.userService.updateUserRating(createReviewDto.reviewedUserId);
      
    return await this.notificationService.reviewNotification(
      createReviewDto.reviewedUserId, // userId (recipient)
      savedReview.id,                 // reviewId
      'New Review',                   // title
      'added review',        // message
      `/users/${createReviewDto.reviewedUserId}/reviews`, // actionUrl
      { stars: createReviewDto.stars, reviewerId: createReviewDto.reviewerId } // metadata (optional)
    );
    
    }

  
    

    async deleteReview(userid:number,id: number) {

      const review = await this.findOne(id);
      if (!review) {
        throw new Error('Review not found');
      }
      if(review.reviewer.id !== userid) {
        throw new Error('You are not allowed to delete this review');
      }
    
      await this.reviewRepository.remove(review);
    
      await this.userService.updateUserRating(review.reviewedUser.id);
    }


    async updateReview(userId:number,updateDto:UpdateReviewDto): Promise<any> {
       
        const review = await this.findOne(updateDto.id);
        console.log('Updating review:', review);
        console.log('Update data:', updateDto);
        console.log('User ID:', userId);
        if (!review) {
            throw new Error('Review not found');
        }
        console.log('Reviewer ID:', review.reviewer.id);
        if (!review) {
          throw new Error('Review not found');
      }
        if(review.reviewer.id !== userId) {

            throw new Error('You are not allowed to update this review');
        }
       
        Object.assign(review, updateDto);
        return this.reviewRepository.save(review);
        

    }
     async paginate (page: number, limit: number) {
        const queryBuilder = this.reviewRepository.createQueryBuilder('review');
        return this.paginationService.paginateQuery(queryBuilder, page, limit);
     }

      async search (searchTerm: string, fields: string[], page: number, limit: number) {
          const queryBuilder = this.reviewRepository.createQueryBuilder('review');
          return this.searchService.searchQuery(queryBuilder, searchTerm, fields, page, limit);
      }



      async findByReviewerId(
        userId: number,
        page: number = 1,
        limit: number = 6
      ): Promise<PaginationResult<Review>> {
        const queryBuilder = this.reviewRepository
          .createQueryBuilder('review')
          .leftJoinAndSelect('review.reviewedUser', 'reviewedUser')
          .leftJoinAndSelect('review.ride', 'ride')
          .where('review.reviewer.id = :userId', { userId })
          .orderBy('review.date', 'DESC');
      
        return this.paginationService.paginateQuery(queryBuilder, page, limit);
      }
      
      async findByReviewedUserId(
        userId: number,
        page: number = 1,
        limit: number = 6
      ): Promise<PaginationResult<Review>> {
        const queryBuilder = this.reviewRepository
          .createQueryBuilder('review')
          .leftJoinAndSelect('review.reviewer', 'reviewer')
          .leftJoinAndSelect('review.ride', 'ride')
          .where('review.reviewedUser.id = :userId', { userId })
          .orderBy('review.date', 'DESC');
      
        return this.paginationService.paginateQuery(queryBuilder, page, limit);
      }

      async findByRideId (rideId: number) {
        return this.reviewRepository.find({ where: { ride: { id: rideId } } });
      }
      async findByReviewerIdAndRideId (reviewerId: number, rideId: number) {  
        return this.reviewRepository.find({ where: { reviewer: { id: reviewerId }, ride: { id: rideId } } });
      }

       async findPaginatedByReviewedUserId(
        reviewedUserId: number,
        page = 1,
        limit = 10,
        sortField: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC',
      ): Promise<PaginationResult<Review>> {
        const qb = this.reviewRepository
          .createQueryBuilder('review')
          .leftJoinAndSelect('review.reviewer', 'reviewer')
          .leftJoin('review.reviewedUser', 'reviewedUser')
          .where('reviewedUser.id = :reviewedUserId', { reviewedUserId });
        
        // Add sorting
        if (sortField) {
          qb.orderBy(`review.${sortField}`, sortOrder);
        }
    
        return this.paginationService.paginateQuery(qb, page, limit);
      }

      async getAverageRating(userId: number): Promise<number | null> {
        const reviews = await this.reviewRepository.find({
          where: [
            { reviewedUser: { id: userId } },
          ],
        });
    
        if (reviews.length === 0) {
          return null;
        }
        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
        const averageRating = totalStars / reviews.length;
    
        return Math.round(averageRating); 
      }
    async searchReviews(
        userId: number,
        searchTerm: string,
        page: number = 1,
        limit: number = 6,
        isMyReviews: boolean = true
      ): Promise<PaginationResult<Review>> {
    console.log('Search params:', { userId, searchTerm, page, limit, isMyReviews });
    
    const queryBuilder = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.reviewedUser', 'reviewedUser') 
      .leftJoinAndSelect('review.ride', 'ride');

    if (isMyReviews) {
      queryBuilder.where('reviewer.id = :userId', { userId });
    } else {
      queryBuilder.where('reviewedUser.id = :userId', { userId });
    }

    const searchFields = [
      'review.comment',
      'reviewedUser.name',        
      'reviewedUser.lastName',     
      'reviewer.name', 
      'reviewer.lastName',
      'ride.departure',
      'ride.arrival'
    ];

    console.log('Query SQL:', queryBuilder.getSql());

    const searchResult = await this.searchService.searchQuery(
      queryBuilder,
      searchTerm,
      searchFields,
      page,
      limit,
    );

    console.log('Search result:', searchResult);

    const totalPages = Math.ceil((searchResult.totalItems || 0) / limit);

    return {
      ...searchResult,
      totalPages,
      currentPage: page,
    };
  }




}
