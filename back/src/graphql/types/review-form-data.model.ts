import { User } from 'src/user/entities/user.entity';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class UserInfo {
    @Field()
    id: number;
    @Field()
    name: string;

    @Field()
    lastName?: string;

    @Field()
    rating?: number;

    @Field()
    phoneNumber?: string;
    
    @Field()
    imageUrl?: string;

}

@ObjectType()
export class RideDetails {

  @Field()
  id: number;

  @Field()
  departure: string;

  @Field()
  date:string;

  @Field()
  arrival: string;

  @Field()
  price: number;

  @Field()
  time: string;
}

@ObjectType()
export class ReviewFormData {
  @Field(() => UserInfo)
  reviewedUser: UserInfo;

  @Field(() => RideDetails)
  ride: RideDetails;
}



@ObjectType()
export class ReviewItem {
  @Field(() => Int)      id: number;
  @Field(() => Float)    rating: number;
  @Field()               createdAt: Date;

  @Field(() => RideDetails)
  ride: RideDetails;

  @Field(() => UserInfo, { nullable: true })
  reviewerUser?: UserInfo;

  @Field(() => UserInfo, { nullable: true })
  reviewedUser?: UserInfo;

  @Field({ nullable: true })
  comment?: string;

}



