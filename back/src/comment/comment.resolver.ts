import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentInput } from './dto/create-comment.input';
import { Post } from '../post/entities/post.entity';
import { AppUser } from '../app-user/entities/app-user.entity';
import { CurrentUser } from 'src/auth/user.decorator';
import { AppUserService } from 'src/app-user/app-user.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/auth.Guard';
import { CommentService } from './comment.service';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly userService :AppUserService,
    private readonly commentService : CommentService,
  ) {}

  @Query(() => [Comment])
  async getAllComments(): Promise<Comment[]> {
    return this.commentRepository.find({ relations: ['post', 'commenter'] });
  }

  @Query(() => [Comment])
  async getCommentsByPost(@Args('postId', { type: () => Int }) postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['commenter', 'post'],
    });
  }
  
  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  async createComment(
    @Args('input') input: CreateCommentInput,
    @CurrentUser() user: AppUser
  ): Promise<Comment> {
    const commenter = await this.userService.findOne(+user.id);
    const comment =await this.commentService.createCommentWithNotif(input,commenter);

    return comment;
  }
}
