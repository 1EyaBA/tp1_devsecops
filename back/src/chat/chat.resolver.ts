import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Chat } from './entities/chat.entity';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateChatInput } from './dto/create-chat.input';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { RideService } from 'src/ride/ride.service';
import { AppUserService } from 'src/app-user/app-user.service';

@Resolver(()=>Chat)
export class ChatResolver {
    constructor(
         private readonly chatService: ChatService,
         private readonly messageService: MessageService,
         private readonly userService: AppUserService,
         private readonly rideService: RideService,
         ) {
    }

    
  @Query(() => [Chat], { name: 'getChats' })
  async GetChats(@Args('userId', { type: () => Int }) userId: number) : Promise<Chat[]>{
    


  return await this.chatService.findByUserId(userId);
  }
  @Query(() => Chat, { name: 'getChat' })
  async GetChat(@Args('chatId', { type: () => Int }) chatId: number) : Promise<Chat>{
    const chat = await this.chatService.findOne(chatId);
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    return chat;
  }
  @Query(() => Chat, { name: 'getChatByRideId' })
  async GetChatByRideId(@Args('rideId', { type: () => Int }) rideId: number) : Promise<Chat>{
    return this.chatService.findByRideId(rideId);
  }
 @Mutation(() => Chat, { nullable: true })
  async CreateChat(@Args('createChatInput', { type: () => CreateChatInput }) createChatInput: CreateChatInput) : Promise<Chat | null>{
    const ride = await this.rideService.findOne(createChatInput.rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }
    if (!ride.driver || ride.driver === null) {
      throw new Error('Ride has no driver assigned');
    }
    console.log("Ride object:", ride);
    console.log("Ride driver:", ride.driver); 
    const driver = await this.userService.findOne(ride.driver.id);
    if (!driver) {
      throw new Error('Driver not found');
    }
    const rider = await this.userService.findOne(createChatInput.riderId);
    if (!rider) {
      throw new Error('Rider not found');
    }
    if (ride.state !== 'Closed') {
    
    
    const chat = await this.chatService.create({
      driver: driver,
      rider: rider,
      ride: ride,});
    if (!chat) {
      throw new Error('Failed to create chat');
    }
    return chat;
  }
    return null;
  }

  @Mutation(() => Boolean)
  async RemoveChat(@Args('chatId', { type: () => Int }) chatId: number) : Promise<boolean>{
    return this.chatService.remove(chatId).then(() => true);
  }
  
}
