import { Module } from '@nestjs/common';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from './entities/app-user.entity';
import { User } from 'src/user/entities/user.entity';

import { Review } from 'src/review/entities/review.entity';
import { AppUserResolver } from './app-user.resolver';
import { SearchService } from 'src/services/searchService';

@Module({
  imports: [TypeOrmModule.forFeature([AppUser,User,Review])],
  controllers: [AppUserController],
  providers: [AppUserService,AppUserResolver,SearchService],
  exports: [AppUserService]
})
export class AppUserModule {}