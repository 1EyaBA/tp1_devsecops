import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { AppUser } from "src/app-user/entities/app-user.entity";
import { Ride } from "src/ride/entities/ride.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType() 
@Entity()
export class JoinRequest {
  @PrimaryGeneratedColumn()
  @Field() 
  id: number;

  @Column({ type: 'timestamp' })
  @Field(() =>  GraphQLISODateTime) 
  date: Date;

  @ManyToOne(()=>AppUser)
  @Field(()=>AppUser,{ nullable: true })
  user: AppUser;

  @ManyToOne(()=>Ride,ride=>ride.joinRequests)
  @Field(()=>Ride,{ nullable: true })
  ride: Ride



}
