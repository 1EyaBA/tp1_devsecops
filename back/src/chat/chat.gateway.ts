
import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageService } from '../message/message.service';

interface MessagePayload {
  text: string;
  chatId: number;
  senderId: number;
}

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private messageService: MessageService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket, 
    @MessageBody() chatId: number
  ) {
    const roomName = `chat_${chatId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
    return { event: 'joinedRoom', data: { chatId, room: roomName } };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket, 
    @MessageBody() chatId: number
  ) {
    const roomName = `chat_${chatId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} left room: ${roomName}`);
    return { event: 'leftRoom', data: { chatId, room: roomName } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket, 
    @MessageBody() payload: MessagePayload
  ) {
    try {
      this.logger.log(`Received message from client ${client.id}: ${JSON.stringify(payload)}`);
      
      // Create message in database using existing service
      const newMessage = await this.messageService.create({
        text: payload.text,
        chatId: payload.chatId,
        senderId: payload.senderId
      });
      
      // Broadcast the message to all clients in the room
      const roomName = `chat_${payload.chatId}`;
      this.logger.log(`Broadcasting message to room: ${roomName}`);
      this.server.to(roomName).emit('messageReceived', newMessage);
      
      // Confirm receipt to sender
      return { success: true, messageId: newMessage.id };
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }
}