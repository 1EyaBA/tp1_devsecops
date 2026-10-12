import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { Ride } from 'src/ride/entities/ride.entity';
import { MessageService } from 'src/message/message.service';
import { AppUser } from 'src/app-user/entities/app-user.entity';

@Injectable()
export class ChatService {
  constructor( @InjectRepository(Chat)
  private chatRepository: Repository<Chat>,

  @InjectRepository(AppUser)
  private userRepository: Repository<AppUser>,

  @InjectRepository(Ride)
  private rideRepository: Repository<Ride>,
  private readonly MessageService: MessageService,
) {

  }

  async create(createChatDto: CreateChatDto) {
    if(!createChatDto.driver.id || !createChatDto.rider.id || !createChatDto.ride.id) {
      throw new Error('Driver ID, Rider ID, and Ride ID are required.');
    }
    const ride=await this.rideRepository.findOne({ where: { id: createChatDto.ride.id } });
    if (!ride) {
      throw new Error('Ride not found.');
    }
    const status = ride.state;
    if(status !=='Closed'){
      
      const driver = await this.userRepository.findOne({ where: { id: createChatDto.driver.id } });
      const rider = await this.userRepository.findOne({ where: { id: createChatDto.rider.id } });
      const chat = this.chatRepository.create({
        driver: driver,
        rider: rider,
        ride: ride
      } as Partial<Chat>);
            return await this.chatRepository.save(chat);
    }
    
  }
  async findByRideId(rideId: number) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.driver', 'driver')
      .leftJoinAndSelect('chat.rider', 'rider')
      .leftJoinAndSelect('chat.ride', 'ride')
      .where('ride.id = :rideId', { rideId })
      .getOne();
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }
  async getMessagesByRideId(id: number) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.driver', 'driver')
      .leftJoinAndSelect('chat.rider', 'rider')
      .leftJoinAndSelect('chat.ride', 'ride')
      .where('ride.id = :id', { id })
      .getOne();
    if (!chat) {
      throw new Error('Chat not found');
    }
    return this.MessageService.getChatMessages(chat.id).then(messages => {
      return messages;
    });


  }

  findAll() {
    return this.chatRepository.find({ relations: ['driver', 'rider'] });
  }
  findByUserId(userId: number) {
  return this.chatRepository
    .createQueryBuilder('chat')
    .leftJoinAndSelect('chat.driver', 'driver')
    .leftJoinAndSelect('chat.rider', 'rider')
    .leftJoinAndSelect('chat.messages', 'messages') 
    .leftJoinAndSelect('messages.sender', 'sender') 
    .where('driver.id = :userId OR rider.id = :userId', { userId })
    .getMany();
}
  findOne(id: number) {
    return this.chatRepository.findOne({ where: { id }, relations: ['driver', 'rider'] });
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return this.chatRepository.update(id, updateChatDto as Partial<Chat>).then(() => {
      return this.chatRepository.findOne({ where: { id }, relations: ['driver', 'rider'] });
    });
  }

  remove(id: number) {
    return this.chatRepository.delete(id).then(() => {
      return { deleted: true };
    });
  }
}
