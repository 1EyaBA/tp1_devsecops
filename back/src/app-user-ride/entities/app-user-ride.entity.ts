import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql'; // Import GraphQL decorators
import { AppUser } from '../../app-user/entities/app-user.entity';
import { Ride } from '../../ride/entities/ride.entity';



@ObjectType()
@Entity()
@Unique(['appUser', 'ride'])
export class AppUserRide {
  @PrimaryGeneratedColumn()
  @Field() 
  id: number;


  @ManyToOne(() => AppUser, (appUser) => appUser.appUserRides)
  @Field(() => AppUser) 
  appUser: AppUser;

  @ManyToOne(() => Ride, (ride) => ride.appUserRides)
  @Field(() => Ride) 
  ride: Ride;
}
