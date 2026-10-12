import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateChatInput {

  @Field(() => Int)
  riderId: number;

  @Field(() => Int)
  rideId: number;
}