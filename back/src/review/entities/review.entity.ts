import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, Float, GraphQLISODateTime } from '@nestjs/graphql'; // Import GraphQL decorators
import { AppUser } from '../../app-user/entities/app-user.entity';
import { Ride } from '../../ride/entities/ride.entity';
import { Max, Min } from 'class-validator';

@ObjectType() // Add @ObjectType() to expose this as a GraphQL type
@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  @Field() // Expose this field in GraphQL
  id: number;

  @Column({ type: 'float' })
  @Field(() => Float) // Expose as a float in GraphQL
  @Min(1, { message: 'Stars must be at least 1' })
  @Max(5, { message: 'Stars must be at most 5' })
  stars: number;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true }) // Expose this field in GraphQL (nullable)
  comment: string;

  @Column({ type: 'date' })
  @Field(() => String) // Change from Date to String
  date: string;

  @ManyToOne(() => AppUser)
  @Field(() => AppUser) // Expose the related AppUser in GraphQL
  reviewer: AppUser;

  @ManyToOne(() => AppUser, (user) => user.reviews)
  @Field(() => AppUser) // Expose the related AppUser in GraphQL
  reviewedUser: AppUser;

  @ManyToOne(() => Ride, { eager: true })
  @Field(() => Ride) // Expose the related Ride in GraphQL
  ride: Ride;
}
