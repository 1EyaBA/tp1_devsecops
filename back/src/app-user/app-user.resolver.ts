// src/app-user/app-user.resolver.ts
import { Resolver, Mutation, Args, Int, Query, Context } from '@nestjs/graphql';
import { AppUser } from './entities/app-user.entity';
import { AppUserService } from './app-user.service';
import { UpdateAppUserInput } from 'src/graphql/inputs/update-app-user.input';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/auth.Guard';
import { CurrentUser } from 'src/auth/user.decorator';
import { UploadPhotoInput } from './dto/update-photo.input';

import { AppUserWithRole } from 'src/graphql/types/AppUserWithRole';
import { SearchResult } from 'src/services/searchService';
import { AppUserSearchResult } from 'src/graphql/types/AppUserSearchResult';


@UseGuards(GqlAuthGuard)
@Resolver(() => AppUser)
export class AppUserResolver {
  constructor(private readonly appUserService: AppUserService) {}

  @Mutation(() => AppUser)
  async updateAppUser(
    @CurrentUser() user: any,  
    @Args('updateAppUserInput') updateAppUserInput: UpdateAppUserInput,
  ): Promise<AppUser> {
    return this.appUserService.update(user.id, updateAppUserInput);
  }
  @Query(() => AppUser, { name: 'getAppUserInfo' })
  async getAppUserInfo(@CurrentUser() user: any): Promise<AppUser | null> {
    const appUser= await this.appUserService.findOne(user.id);
    if (!appUser) {
        throw new NotFoundException('User not found');
      }
      const baseUrl = 'http://localhost:3000'; 

      appUser.imageUrl = appUser.imageUrl ? `${baseUrl}${appUser.imageUrl}` : null;
      
      return appUser;
  }

  @Mutation(() => AppUser)
async updatePhoto(
  @CurrentUser() user: any,
  @Args('updatePhotoInput') updatePhotoInput: UploadPhotoInput
): Promise<AppUser> {
  const file = await updatePhotoInput.file;
  return this.appUserService.uploadPhoto(user.id, file);
}

@Query(() => AppUserSearchResult)
async getUsers(
  @Args("searchTerm", { type: () => String }) searchTerm: string,
  @Args("page", { type: () => Int, defaultValue: 1 }) page: number,
  @Args("limit", { type: () => Int, defaultValue: 10 }) limit: number
): Promise<SearchResult<AppUser>> {
  const result = await this.appUserService.searchUsers(searchTerm, page, limit);

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Update imageUrl for each user
  result.data = result.data.map((user) => {
    if (user.imageUrl) {
      user.imageUrl = `${baseUrl}${user.imageUrl}`;
    }
    return user;
  });

  return result;
}

  @Query(() => AppUser, { name: 'getUserById', nullable: true })
  async getUserById(
      @Args('id', { type: () => Int }) id: number,
  ): Promise<AppUser> {
    return this.appUserService.findById(id);
  }

   @Query(() => AppUser, { name: 'getAppUserById' })
  async getAppUserById(@Args('id', { type: () => Int }) id: number): Promise<AppUser | null> {
    const appUser= await this.appUserService.findOne(id);
    if (!appUser) {
      throw new NotFoundException('User not found');
    }
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/'; 

    appUser.imageUrl = appUser.imageUrl ? `${baseUrl}${appUser.imageUrl}` : null;
    
    return appUser;
  }

}