import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from "class-validator";
import { Not } from "typeorm";

export class CreateReviewDto {


    @IsNumber({}, { message: 'Stars must be a number' })
    @Min(1, { message: 'Stars must be at least 1' }) 
    @Max(5, { message: 'Stars must be at most 5' }) 
    @IsPositive({ message: 'Stars must be a positive number' }) 
    stars: number;

    @IsNotEmpty({ message: 'Comment cannot be empty' })
    @IsString({ message: 'Comment must be a string' })
    comment?: string;


    
    @IsInt({ message: 'Reviewer user must be an integer' })
    reviewerId: number;

    @IsInt({ message: 'Reviewed user must be an integer' })
    reviewedUserId: number;



    @IsInt({ message: 'Ride ID must be an integer' })
    rideId: number;





  


}
