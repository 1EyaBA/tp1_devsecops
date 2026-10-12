
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GenericService } from '../services/genericService';
import { InjectRepository } from '@nestjs/typeorm';
import { AppUser } from './entities/app-user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { User } from '../user/entities/user.entity';
import { Review } from '../review/entities/review.entity';
import { saveFile } from '../common/helpers/file-upload.helper';

import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { SearchResult, SearchService } from 'src/services/searchService';


@Injectable()
export class AppUserService extends GenericService {
  constructor(
    
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly searchService: SearchService,


  ) {
    super(appUserRepo);
  }
  async update(id: number, dto: UpdateUserDto): Promise<AppUser> {
    const user = await this.appUserRepo.findOne({ where: { id} });
    if (!user) throw new NotFoundException('AppUser not found');
    Object.assign(user, dto);
    return this.appUserRepo.save(user);
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.appUserRepo.findOne({ where: { email } });
  }

  async updateUserRating(userId: number): Promise<void> {
    try {
      console.log("Started updating user rating for userId:", userId);
  
      const reviews = await this.reviewRepository.find({
        where: { reviewedUser: { id: userId } },
      });
  
      if (reviews.length === 0) {
        console.log("No reviews found for userId:", userId);
        return; 
      }
  
      console.log("Reviews found:", reviews);
  
      const totalRating = reviews.reduce((acc, review) => acc + review.stars, 0);
      const averageRating = totalRating / reviews.length;
  
      console.log("Total rating:", totalRating);
      console.log("Average rating:", averageRating);
  
      const user = await this.appUserRepo.findOne({
        where: { id: userId },
      });
  
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
  
      user.rating = averageRating;
      console.log("Updating user rating to:", averageRating);
  
      await this.appUserRepo.save(user);
  
      console.log("User rating successfully updated for userId:", userId);
    } catch (error) {
      console.error("Error updating user rating:", error.message);
      throw error;
    }
  }
  async uploadPhoto(userId: number, file: string ): Promise<AppUser> {
    const user = await this.appUserRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  
    const imageUrl = await saveFile(file);
    user.imageUrl = imageUrl;
  
    return this.appUserRepo.save(user);
  }


  async findRecent(limit: number): Promise<AppUser[]> {
    return this.appUserRepo.find({
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async findById(id: number): Promise<AppUser> {
    const user = await this.appUserRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
  async searchUsers(
      searchTerm: string,
      page: number,
      limit: number
  ): Promise<SearchResult<AppUser>> {
    const queryBuilder = this.appUserRepo.createQueryBuilder("appUser");

    return this.searchService.searchQuery(queryBuilder, searchTerm, [
      "appUser.name",
      "appUser.lastName",
    ], page, limit);
  }
 



}
  
