import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateAppUserDto {

    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    lastName?: string;
  
    @IsOptional()
    dateOfBirth?: string;
  
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}
