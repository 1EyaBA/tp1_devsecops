import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  @Index() 
  subscriberId: number;

  @Column()
  @Index() 
  targetId: number;

  @Column()
  @Index() 
  targetType: string;

  @CreateDateColumn()
  createdAt: Date;
}