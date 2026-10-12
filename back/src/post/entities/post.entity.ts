import { ObjectType, Field, Int, Float, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { AppUser } from '../../app-user/entities/app-user.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Ride } from '../../ride/entities/ride.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { JoinRequest } from 'src/join-request/entities/join-request.entity';
import { C } from 'graphql-ws/dist/common-DY-PBNYy';

export enum PostStatus{
  OPEN='open',
  CLOSED='closed'
}
@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar' })
  destination: string;

  @Field()
  @Column({ type: 'varchar' })
  departure: string;

  @Field(() => String) 
  @Column({ type: 'date' })
  date: Date;

  @Field()
  @Column({ type: 'varchar' })
  time: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  seatCount: number;

  @Field()
  @Column({ type: 'varchar' })
  frequency: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  price?: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  contactInfo?: string;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, comment => comment.post, { cascade: true })
  comments?: Comment[];

  @Field(() => AppUser)
  @ManyToOne(() => AppUser, user => user.posts)
  postOwner: AppUser;

  @Field(() => [Ride], { nullable: true })
  @OneToMany(() => Ride, ride => ride.post)
  listRide: Ride[];

  @Field({ nullable: true })
  @Column({ default: 'OPEN' })
  status: PostStatus;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  chatId: number;

}
