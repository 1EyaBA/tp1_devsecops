import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
/*import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';*/


@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    //@Inject('PUB_SUB') private pubSub: PubSub<{ messageAdded: any }>,
  ) {}

  @Mutation(() => Message)
  async createMessage(@Args('createMessageInput') createMessageInput: CreateMessageInput) {
    const newMessage = await this.messageService.create(createMessageInput);
    // this.pubSub.publish('messageAdded', { messageAdded: newMessage });
    return newMessage;
  }

  @Query(() => [Message], { name: 'getChatMessages' })
  getChatMessages(@Args('chatId', { type: () => Int }) chatId: number) {
    return this.messageService.getChatMessages(chatId);
  }

  @Query(() => [Message], { name: 'messages' })
  findAll() {
    return this.messageService.findAll();
  }

  @Query(() => Message, { name: 'message' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.messageService.findOne(id);
  }

  @Mutation(() => Message)
  updateMessage(@Args('updateMessageInput') updateMessageInput: UpdateMessageInput) {
    return this.messageService.update(updateMessageInput.id, updateMessageInput);
  }

  @Mutation(() => Boolean)
  removeMessage(@Args('id', { type: () => Int }) id: number) {
    return this.messageService.remove(id).then(() => true);
  }
/*
  @Subscription(() => Message, {
      name: 'messageAdded', 
    filter: (payload, variables) => {
      return payload.messageAdded.chat.id === variables.chatId;
    }
  })
messageAdded(@Args('chatId', { type: () => Int }) chatId: number) {
  return (this.pubSub as any).asyncIterator('messageAdded');
  }
 */
}