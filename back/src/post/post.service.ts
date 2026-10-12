import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostStatus } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { GenericService } from '../services/genericService';
import { CreatePostInput } from './dto/post-graphql.dto';
import { Ride, RideState } from 'src/ride/entities/ride.entity';
import { AppUserService } from 'src/app-user/app-user.service';
import { CreateRideInput } from 'src/ride/dto/create-ride.input';
import { RideService } from 'src/ride/ride.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { SearchService } from 'src/services/searchService';

@Injectable()
export class PostService extends GenericService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Ride) private rideRepo: Repository<Ride>,
    private readonly userService: AppUserService,
    private readonly subscriptionService : SubscriptionService,
    private readonly rideService: RideService,
    private readonly searchService: SearchService,) {
    super(postRepo);
  }


  getPostsQueryBuilder(): SelectQueryBuilder<Post> {
    return this.postRepo.createQueryBuilder('post');
  }
  async create(createPostInput: CreatePostInput): Promise<Post> {
    const { postOwnerId, listRide, ...rest } = createPostInput;
  
    const post = this.postRepo.create(rest);
  
    const user = await this.userService.findOne(postOwnerId);
    if (!user) {
      throw new NotFoundException(`User with ID ${postOwnerId} not found`);
    }
    post.postOwner = user;
  
    if (listRide?.length) {
      post.listRide = await this.rideRepo.findBy({ id: In(listRide) });
    
      if (post.listRide.length !== listRide.length) {
        throw new BadRequestException('Some ride IDs are invalid');
      }
    }
    
    const savedPost = await this.postRepo.save(post);

    const rideInput: CreateRideInput = {
      date: createPostInput.date,
      time: createPostInput.time,
      departure: createPostInput.departure,
      arrival: createPostInput.destination,
      price: createPostInput.price ?? 0, 
      nbPassengers: createPostInput.seatCount,
      state: RideState.NOT_STARTED,
    };
  
    await this.rideService.createRide(rideInput, savedPost);


    /*await this.subscriptionService.subscribe(
      postOwnerId,
      post.id,
      'post' 
    );*/
       // await this.notificationService.notifyPostUpdated(postId, userId);

    return savedPost;

  }
  
  
  async findAll(options = {}): Promise<Post[]> {
    return this.postRepo.createQueryBuilder('post')
  .leftJoinAndSelect('post.postOwner', 'postOwner')
  .leftJoinAndSelect('post.listRide', 'listRide')
  .leftJoinAndSelect('post.comments', 'comments')
.leftJoinAndSelect('comments.commenter', 'commenter')

  .getMany();

  }


  async findAllWithSearch(
    searchTerm?: string,
    page = 1,
    limit = 10,
    filter?: string,
  ): Promise<{ data: Post[]; totalItems: number; currentPage: number }> {
    const queryBuilder = this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.postOwner', 'postOwner')
      .leftJoinAndSelect('post.listRide', 'listRide')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.commenter', 'commenter')
      .where('post.status != :status', { status: PostStatus.CLOSED })
      if (filter) {
        queryBuilder.andWhere('postOwner.id = :ownerId', { ownerId: filter });
      }
    const fieldsToSearch = ['post.destination', 'post.departure', 'post.date', 'post.time'];

  if (searchTerm) {
    const result = await this.searchService.searchQuery<Post>(
      queryBuilder,
      searchTerm,
      fieldsToSearch,
      page,
      limit,
    );
    result.data = this.sortPostsByDateProximity(result.data);
    return result;
  }

const allData = await queryBuilder.getMany();
const sortedData = this.sortPostsByDateProximity(allData);
const startIndex = (page - 1) * limit;
const endIndex = startIndex + limit;
const paginatedData = sortedData.slice(startIndex, endIndex);
const total = sortedData.length;

return {
  data: paginatedData,
  totalItems: total,
  currentPage: page,
};

}
//closest in date sort
private sortPostsByDateProximity(posts: Post[]): Post[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    const diffA = Math.abs(dateA - today.getTime());
    const diffB = Math.abs(dateB - today.getTime());
    
    return diffA - diffB; 
  });
}




  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.listRide', 'listRide')
      .leftJoinAndSelect('post.postOwner', 'postOwner')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.commenter', 'commenter')
      .where('post.id = :id', { id })
      .getOne();
  
    if (!post) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  
    return post;
  }


  async close(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });
  
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  
    post.status = PostStatus.CLOSED;
  
    return await this.postRepo.save(post);
  }

  async findMatchingRideAndOwner(postId: number): Promise<{ ride: Ride | null; postOwnerId: number | null }> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['listRide', 'postOwner'],
    });
  
    if (!post) return { ride: null, postOwnerId: null };
  
    const matchingRide = post.listRide.find((ride) => ride.state === RideState.NOT_STARTED);
  
    return {
      ride: matchingRide ?? null,
      postOwnerId: post.postOwner?.id ?? null,
    };
  }
  async remove(postId: number): Promise<void> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['listRide'],
    });
  
    if (!post) {
      throw new Error('Post not found');
    }
    
  
    const matchingRide = post?.listRide[post.listRide.length - 1] ?? null;
  
    if (matchingRide) {
      await this.rideRepo.delete(matchingRide.id);
    }
  
    const updatedPost = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['listRide'],
    });
  
    if (!updatedPost || updatedPost.listRide.length === 0) {
      await this.postRepo.delete(postId);
    } else {
      
      const nextRide = updatedPost?.listRide[updatedPost.listRide.length - 1] ?? null;
      
  
      if (nextRide) {
        updatedPost.date = nextRide.date;
        updatedPost.time = nextRide.time;
        updatedPost.status=PostStatus.CLOSED;
        await this.postRepo.save(updatedPost);
      }
    }
  }
 
  
  
}
