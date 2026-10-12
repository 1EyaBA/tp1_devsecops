import { Field, ObjectType } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    TableInheritance,
  } from 'typeorm';
  
  @Entity()
  @ObjectType()
  @TableInheritance({ column: { type: 'varchar', name: 'type' } })
  export abstract class User {
    @Field()
    @PrimaryGeneratedColumn()
    id: number;
    
    @Field()
    @Column({ unique: true })
    email: string;
    
    @Field()
    @Column()
    password: string;
    
    @Field()
    @Column({ default: 'user' }) 
    role: 'user' | 'admin';
  }
  