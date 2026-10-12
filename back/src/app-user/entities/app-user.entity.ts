import { ChildEntity, Column, Entity, OneToMany } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql'; // Import GraphQL decorators
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { Review } from '../../review/entities/review.entity';
import { AppUserRide } from '../../app-user-ride/entities/app-user-ride.entity';
import { Ride } from '../../ride/entities/ride.entity';
@ChildEntity()
@ObjectType() // Add @ObjectType() to mark this as a GraphQL type
export class AppUser extends User {
  @Field()
  @Column()
  @Field() // Expose this field in GraphQL
  name: string;


  @Field()
  @Column()
  @Field() // Expose this field in GraphQL
  lastName: string;

  @Field({ nullable: true })
  @Column({  nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  phoneNumber: string;
  
  @Field()
  @Column()
  @Field({ nullable: true }) 
  imageUrl: string;

  @OneToMany(() => Post, (post) => post.postOwner)
  @Field(() => [Post])
  posts: Post[];

  @OneToMany(() => Review, (review) => review.reviewedUser)
  @Field(() => [Review]) 
  reviews: Review[];

  @Column({ type: 'float' })
  @Field({ nullable: true })  
  rating: number;

  @OneToMany(() => AppUserRide, (appUserRide) => appUserRide.appUser)
  @Field(() => [AppUserRide]) 
  appUserRides: AppUserRide[];

  @OneToMany(() => Ride, ride => ride.driver)
  drivenRides: Ride[];

}
