import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateNotificationInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  actionUrl?: string;

  @Field(() => GraphQLJSONObject, { nullable: true }) 
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;
}
