import { ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { ChildEntity } from 'typeorm';
@ChildEntity()
@ObjectType()
export class Admin extends User {

}
