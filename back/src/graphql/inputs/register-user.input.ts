import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  name: string;
  
  @Field()
  @IsNotEmpty()
  lastName: string;
  
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @Length(6, 20)
  @IsNotEmpty()
  password: string;
}
