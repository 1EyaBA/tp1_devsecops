import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsDate, IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateAppUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
