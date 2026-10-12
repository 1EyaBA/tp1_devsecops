import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {

    @IsInt({ message: 'Review ID must be an integer' })
    id: number;

    @IsNumber({}, { message: 'Stars must be a number' })
    @Min(1, { message: 'Stars must be at least 1' })
    @Max(5, { message: 'Stars must be at most 5' })
    @IsPositive({ message: 'Stars must be a positive number' })
    stars: number;



    @IsNotEmpty({ message: 'Comment cannot be empty' })
    @IsString({ message: 'Comment must be a string' })
    comment?: string;


    

}
