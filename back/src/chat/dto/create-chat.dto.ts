import { F } from "@faker-js/faker/dist/airline-BUL6NtOJ";
import { Field, InputType } from "@nestjs/graphql";
import { AppUser } from "src/app-user/entities/app-user.entity";
import { Ride } from "src/ride/entities/ride.entity";
import { User } from "src/user/entities/user.entity";


export class CreateChatDto {
    
    driver: AppUser;
    
    rider: AppUser;
    
    ride: Ride;
}
