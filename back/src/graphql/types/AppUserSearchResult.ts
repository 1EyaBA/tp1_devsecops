import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { AppUser } from "src/app-user/entities/app-user.entity";

@ObjectType()
export class AppUserSearchResult {

  @Field(() => [AppUser])
  @Type(() => AppUser)
  data: AppUser[];

  @Field()
  totalItems: number;

  @Field()
  currentPage: number;
}

