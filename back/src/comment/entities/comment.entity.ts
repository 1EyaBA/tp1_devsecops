import { ObjectType, Field } from '@nestjs/graphql';
import { AppUser } from '../../app-user/entities/app-user.entity';
import { Post } from '../../post/entities/post.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@ObjectType() 
@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: 'text' })
  @Field() 
  text: string;

  @Column({ type: 'timestamp' })
  @Field() 
  date: Date;
  
  @ManyToOne(() => Post, (post) => post.comments)
  @Field(() => Post) 
  post: Post;

  @ManyToOne(() => AppUser, { eager: true })
  @Field(() => AppUser)
  commenter: AppUser;
}
