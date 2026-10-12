import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Ride } from './entities/ride.entity';
import { GenericService } from '../services/genericService';
import { RideState } from './entities/ride.entity';
import { PaginationResult, PaginationService } from 'src/services/paginationService';
import { AppUserRideService } from 'src/app-user-ride/app-user-ride.service';
import { AppUserService } from 'src/app-user/app-user.service';
import { Post } from 'src/post/entities/post.entity';
import { CreateRideInput } from './dto/create-ride.input';
import { EventStreamService, EventType } from 'src/SSE/sse-subscription.service';
import { AppUserRide } from 'src/app-user-ride/entities/app-user-ride.entity';
import { AppUserWithRole } from 'src/graphql/types/AppUserWithRole';
import { Role } from 'src/enums/role';
import { App } from 'supertest/types';
import { SearchService } from 'src/services/searchService';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class RideService extends GenericService {
  constructor(@InjectRepository(Ride) private readonly rideRepo:Repository<Ride>,   
  @InjectRepository(User) private readonly UserRepo: Repository<User>,
  private readonly paginationService: PaginationService,
  private userService: AppUserService,
  private appUserRideService: AppUserRideService,
  private readonly EventStreamService: EventStreamService,
  private readonly searchService: SearchService, 
  
  private readonly notificationService: NotificationService
  

){
    
    super(rideRepo);
  }
  async createRide(createRideInput: CreateRideInput, post: Post): Promise<Ride> {
    const ride = this.rideRepo.create({
      ...createRideInput,
      post,
      driver:post.postOwner,
    });
    return await this.rideRepo.save(ride);
  }
  
  async findByState(state: RideState): Promise<Ride[]> {
    return this.rideRepo.find({
      where: { state },
      relations: ['appUserRides','post','post.postOwner'],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Ride[]> {
    return this.rideRepo.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['appUserRides'],
    });
  }

  async findByDriver(driverId: number): Promise<Ride[]> {
    return this.rideRepo
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.post', 'post')
      .leftJoinAndSelect('post.postOwner', 'postOwner')
      .leftJoinAndSelect('ride.appUserRides', 'appUserRide')
      .leftJoinAndSelect('appUserRide.appUser', 'appUser')
      .where('postOwner.id = :driverId', { driverId })
      .getMany();
  }
  
async findPaginatedByDriver(
  driverId: number,
  page = 1,
  limit = 10,
): Promise<PaginationResult<Ride>> {
  const qb = this.rideRepo
    .createQueryBuilder('ride')
    .leftJoinAndSelect('ride.appUserRides', 'appUserRides')
    .leftJoinAndSelect('appUserRides.appUser', 'appUser')
    .leftJoin('ride.driver', 'driver')
    .where('driver.id = :driverId', { driverId });

  return this.paginationService.paginateQuery(qb, page, limit);
}

async findPaginatedByPassenger(
  passengerId: number,
  page = 1,
  limit = 10,
): Promise<PaginationResult<Ride>> {
  const qb = this.rideRepo
  .createQueryBuilder('ride')
  .leftJoinAndSelect('ride.driver', 'driver')
  .leftJoin('ride.appUserRides', 'appUserRide')
  .leftJoin('appUserRide.appUser', 'appUser')
  .where('appUser.id = :passengerId', { passengerId });


  return this.paginationService.paginateQuery(qb, page, limit);
}


async findByPassenger(passengerId: number): Promise<Ride[]> {
  return this.rideRepo
    .createQueryBuilder('ride')
    .innerJoin('ride.appUserRides', 'appUserRide')
    .innerJoin('appUserRide.appUser', 'appUser')
    .where('appUser.id = :passengerId', { passengerId })
    .leftJoinAndSelect('ride.post', 'post')
    .leftJoinAndSelect('post.postOwner', 'driver')
    .leftJoinAndSelect('ride.appUserRides', 'allAppUserRides')
    .leftJoinAndSelect('allAppUserRides.appUser', 'eachPassenger')
    .getMany();
}
async addPassengerToRide(rideId: number, userId: number): Promise<AppUserRide> {
  const ride = await this.rideRepo.findOne({ where: { id: rideId } });
  if (!ride) throw new Error('Ride not found');
  const rider= await this.UserRepo.findOne({
    where: { id: ride.driver?.id },  
    relations: ['appUserRides'],
  });
  if (!rider) throw new Error('Rider not found for this ride');

  const user = await this.userService.findById(userId);
  if (!user) throw new Error('User not found');
  await this.notificationService.JoinAcceptNotification(
    userId, // recipientId
    rider.id, 
    ride.id, 
    'Join Request Accepted', // title
    `You have been accepted to join the ride from ${ride.departure} to ${ride.arrival}`, // message
    `/rides`, // actionUrl

  )
  /*
  this.EventStreamService.emitEvent({ recipientId: userId, type: EventType.JOIN_ACCEPT, targetId: ride.id, payload: { userId } });*/
  return this.appUserRideService.addPassenger(user, ride);
}

  async findCommonRides(userId1: number, userId2: number): Promise<Ride[]> {
    return this.rideRepo
        .createQueryBuilder('ride')
        .leftJoin('ride.appUserRides', 'aur1')
        .leftJoin('ride.appUserRides', 'aur2')
        .leftJoin('aur1.appUser', 'user1')
        .leftJoin('aur2.appUser', 'user2')
        .where(
            `(aur1.role = 'passenger' AND user1.id = :userId1) OR (ride.driverId = :userId1)`,
            { userId1 }
        )
        .andWhere(
            `(aur2.role = 'passenger' AND user2.id = :userId2) OR (ride.driverId = :userId2)`,
            { userId2 }
        )
        .getMany();
  }





  async countRidesPerMonth(): Promise<{ month: string; count: number }[]> {
    const result = await this.rideRepo
        .createQueryBuilder('ride')
        .select("DATE_FORMAT(ride.date, '%Y-%m')", 'month') 
        .addSelect('COUNT(*)', 'count')
        .groupBy('month')
        .orderBy('month', 'DESC')
        .limit(12)
        .getRawMany();

    return result.map(row => ({
      month: row.month,                  
      count: parseInt(row.count, 10),
    }));
  }


  async findRecent(limit: number): Promise<Ride[]> {
    return this.rideRepo.find({
      order: { date: 'DESC' },
      take: limit,
    });
  }

async findByUserId(userId: number): Promise<Ride[]> {
  return this.rideRepo
    .createQueryBuilder('ride')
    .leftJoinAndSelect('ride.appUserRides', 'appUserRide')
    .leftJoinAndSelect('appUserRide.appUser', 'appUser')
    .leftJoinAndSelect('ride.driver', 'driver')
    .leftJoinAndSelect('ride.post', 'post')
    .leftJoinAndSelect('ride.joinRequests', 'joinRequests')
    .where('appUser.id = :userId', { userId }) // User is a passenger
    .orWhere('driver.id = :userId', { userId }) // User is a driver
    .getMany();
}

async getUsersForRide(rideId: number): Promise<AppUserWithRole[]> {
  const ride = await this.rideRepo.findOne({
    where: { id: rideId },
    relations: ['driver', 'appUserRides', 'appUserRides.appUser'],
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  const users: AppUserWithRole[] = [];

  if (ride.driver) {
    users.push(new AppUserWithRole(ride.driver, Role.DRIVER));
  }

  ride.appUserRides.forEach((appUserRide) => {
    if (appUserRide.appUser) {
      users.push(new AppUserWithRole(appUserRide.appUser, Role.PASSENGER));
    }
  });

  return users;
}

async findOne(id: number): Promise<Ride | null>{
  return this.rideRepo.findOne({
  where: { id },
  relations: ['driver'],
});

}

async closeRide(rideId: number, userId: number): Promise<Ride> {
  const ride = await this.rideRepo.findOne({
    where: { id: rideId },
    relations: ['driver'],
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  // Verify the ride has a driver and the user is the driver
  if (!ride.driver || ride.driver.id !== userId) {
    throw new Error('Only the driver can close a ride');
  }

  // Check if ride is already closed
  if (ride.state === RideState.CLOSED) {
    throw new Error('Ride is already closed');
  }

  ride.state = RideState.CLOSED;
  return await this.rideRepo.save(ride);
}



async searchRidesByUser(
  userId: number,
  searchTerm: string,
  page: number = 1,
  limit: number = 10,
  filterType?: string
): Promise<PaginationResult<Ride>> {
  let queryBuilder = this.rideRepo
    .createQueryBuilder('ride')
    .leftJoinAndSelect('ride.post', 'post')
    .leftJoinAndSelect('post.postOwner', 'postOwner')
    .leftJoinAndSelect('ride.appUserRides', 'appUserRides')
    .leftJoinAndSelect('appUserRides.appUser', 'rideUser');

  if (filterType === 'yourRides') {
    queryBuilder = queryBuilder.where('post.postOwnerId = :userId', { userId });
  } else if (filterType === 'ridesTaken') {
    queryBuilder = queryBuilder
      .innerJoin('ride.appUserRides', 'userRides')
      .where('userRides.appUserId = :userId', { userId });
  } else {
    queryBuilder = queryBuilder.where(
      '(post.postOwnerId = :userId OR EXISTS (SELECT 1 FROM app_user_ride aur WHERE aur.rideId = ride.id AND aur.appUserId = :userId))',
      { userId }
    );
  }

  const searchFields = [
    'ride.departure',
    'ride.arrival',
    'postOwner.name',
    'postOwner.lastName',
    'rideUser.name',
    'rideUser.lastName'
  ];

 const searchResults= await this.searchService.searchQuery(
    queryBuilder,
    searchTerm,
    searchFields,
    page,
    limit
  );
  const totalPages = Math.ceil(searchResults.totalItems / limit);
  return {
    data: searchResults.data,
    totalItems: searchResults.totalItems,
    currentPage: page,
    totalPages: totalPages,
  };
}
}
