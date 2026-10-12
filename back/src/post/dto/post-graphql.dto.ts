import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field()
  destination: string;

  @Field()
  departure: string;

  @Field()
  date: Date;

  @Field()
  time: string;

  @Field(() => Int)
  seatCount: number;

  @Field()
  frequency: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  contactInfo?: string;

  @Field(() => [String]) 
  listRide: string[];

  @Field()
  postOwnerId: number; 
}
