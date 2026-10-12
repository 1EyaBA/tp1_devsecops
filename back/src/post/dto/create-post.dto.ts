import { IsString, IsOptional, IsNumber, IsDateString, IsInt, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  destination: string;

  @IsString()
  departure: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsInt()
  seatCount: number;

  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}
