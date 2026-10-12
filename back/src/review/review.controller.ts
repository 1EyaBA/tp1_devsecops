import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from 'src/auth/user.decorator';
import { MyUser } from 'src/auth/decorators/my_user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';

@Controller('review')
@UseGuards(GqlAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(GqlAuthGuard)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto,@MyUser() user: any) {
    createReviewDto.reviewerId = user.id; 
    return this.reviewService.createReview(createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @UseGuards(GqlAuthGuard)
  @Patch(':id')
  update(@MyUser()userInfo, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.updateReview(userInfo.id,updateReviewDto);
  }

  @UseGuards(GqlAuthGuard)
  @Delete(':id')
  remove(@MyUser() userInfo,@Param('id') id: string) {
    return this.reviewService.deleteReview(userInfo.id,+id);
  }

  @Get('paginate')
  paginate(@Query('page') page: number, @Query('limit') limit: number) {
    return this.reviewService.paginate(Number(page), Number(limit));
  }
  

  @UseGuards(GqlAuthGuard)
  @Get('search')
  search(
    @Query('searchTerm') searchTerm: string,
    @Query('fields') fields: string[],
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.reviewService.search(searchTerm, fields, Number(page), Number(limit));
  }
  

  @Get('reviewedUser/:reviewedUserId')
  findByReviewedUserId(@Param('reviewedUserId') reviewedUserId: number) {
    return this.reviewService.findByReviewedUserId(reviewedUserId);
  }



  @Get('reviewer/:reviewerId')
  findByReviewerId(@Param('reviewerId') reviewerId: number) {
    return this.reviewService.findByReviewerId(reviewerId);
  }



  @Get('ride/:rideId')
  findByRideId(@Param('rideId') rideId: number) {
    return this.reviewService.findByRideId(rideId);
  }


  
    @Get('reviewer/:reviewerId/ride/:rideId')
    findByReviewerIdAndRideId(@Param('reviewerId') reviewerId: number, @Param('rideId') rideId: number) {
      return this.reviewService.findByReviewerIdAndRideId(reviewerId, rideId);
    }
}
