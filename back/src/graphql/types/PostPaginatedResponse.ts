import { Post } from "src/post/entities/post.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PostPaginatedResponse {
  @Field(() => [Post])
  data: Post[];

  @Field()
  totalItems: number;

  @Field()
  currentPage: number;
}
