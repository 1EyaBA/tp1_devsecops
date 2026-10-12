import { Message } from 'src/message/entities/message.entity';
import { Entity, OneToMany,ManyToOne, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Ride } from 'src/ride/entities/ride.entity';
import { ObjectType, Field } from '@nestjs/graphql';
import { AppUser } from 'src/app-user/entities/app-user.entity';


@ObjectType()
@Entity()
export class Chat {
  @Field(() => Number)  
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => [Message])
  @OneToMany(()=>Message,message=>message.chat)
  messages: Message[];

  @Field(() => AppUser)
  @ManyToOne(() => AppUser, { eager: true })
  driver: AppUser;

  @Field(() => AppUser)
  @ManyToOne(() => AppUser, { eager: true })
  rider: AppUser;
  
  @Field(() => Ride)
  @OneToOne(() => Ride, { eager: true })  
  @JoinColumn()
  ride: Ride;
}
