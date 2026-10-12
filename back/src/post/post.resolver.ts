import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Post, PostStatus } from './entities/post.entity';
import { PostService } from './post.service';
import { CreatePostInput } from './dto/post-graphql.dto';
import { Ride, RideState } from 'src/ride/entities/ride.entity';
import { Int } from 'type-graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Logger, UseGuards } from '@nestjs/common';
import { GraphQLJSONObject } from 'graphql-type-json';
import { MatchingRideResult } from './dto/matching-ride-result.dto';
import { SearchService } from 'src/services/searchService';
import { PostPaginatedResponse } from 'src/graphql/types/PostPaginatedResponse';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';
import { Roles } from 'src/auth/role.decorator';


@UseGuards(GqlAuthGuard)
@Roles('user') 
@Resolver(() => Post)
export class PostResolver {
  private readonly logger = new Logger('EventEmitter');
  constructor(private readonly postService: PostService,private readonly searchService: SearchService,
    @InjectRepository(Post) private readonly postRepository :Repository<Post>
  ) {}
    @Query(() => PostPaginatedResponse, { name: 'getPosts' })
    async getPosts(
      @Args('searchTerm', { nullable: true }) searchTerm?: string,
      @Args('page', { type: () =>Int, nullable: true }) page = 1,
      @Args('limit', { type: () => Int, nullable: true }) limit = 10,
      @Args('filter', { nullable: true }) filter?: string,
    ): Promise<PostPaginatedResponse> {
      console.log('Resolver executed with searchTerm:', searchTerm);
  
      const result = await this.postService.findAllWithSearch(searchTerm, page, limit,filter);
      console.log('Search result:', result);
  
      return {
        data: result.data,
        totalItems: result.totalItems,
        currentPage: result.currentPage,
      };
    }

  @Query(() => Post, { name: 'getPostById' })
  async getPostById(@Args('id') id: string): Promise<Post> {
    const post = await this.postService.findOne(+id);
   return post;
  }
  @Mutation(() => Post)
async createPost(@Args('createPostInput') createPostInput: CreatePostInput): Promise<Post> {
  return this.postService.create(createPostInput);
}
@Query(() => MatchingRideResult, { name: 'matchingRide', nullable: true })
async getMatchingRide(
  @Args('postId', { type: () => Int }) postId: number
): Promise<MatchingRideResult | null> {
  return this.postService.findMatchingRideAndOwner(postId);
}




@Mutation(() => Boolean)
async deletePost(@Args('id',{ type: () => Int }) id: number): Promise<boolean> {
  try {
    await this.postService.remove(id);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}


  @Mutation(() => Boolean)
  async closepost(
    @Args('id',{ type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.postService.close(id);
    return true;

  }

}