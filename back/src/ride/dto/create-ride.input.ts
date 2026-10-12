// create-ride.input.ts
import { InputType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { RideState } from '../entities/ride.entity';

@InputType()
export class CreateRideInput {
  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @Field()
  @IsNotEmpty()
  @IsString()
  time: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  departure: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  arrival: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  nbPassengers: number;

  @Field({ nullable: true })
  @IsEnum(RideState)
  state?: RideState = RideState.NOT_STARTED;
}