
import {
  Controller,
  Get,
  Param,
  Res,
  Headers,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { SseSubscriptionService } from './sse-subscription.service';

@Controller('events')
export class SseNotificationsController {
  private readonly logger = new Logger(SseNotificationsController.name);

  constructor(
    private readonly sseSubscriptionService: SseSubscriptionService,
  ) {}

  @Get('stream/:userId')
  async streamEvents(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() response: Response,
    @Headers('accept') accept: string,
  ) {
    // client accepts SSE
    if (!accept || !accept.includes('text/event-stream')) {
      return response.status(400).json({
        error: 'Client must accept text/event-stream',
      });
    }

    this.logger.log(`SSE connection established for user ${userId}`);

    //  SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    response.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to notification stream',
      timestamp: new Date().toISOString(),
    })}\n\n`);

    
    const unsubscribe = this.sseSubscriptionService.subscribe(userId, response);

    
    const cleanup = () => {
      this.logger.log(`SSE connection closed for user ${userId}`);
      unsubscribe();
    };

    response.on('close', cleanup);
    response.on('error', cleanup);

    const heartbeat = setInterval(() => {
      if (response.writableEnded) {
        clearInterval(heartbeat);
        return;
      }
      response.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      })}\n\n`);
    }, 30000); //  heartbeat every 30 seconds

    
    response.on('close', () => clearInterval(heartbeat));
  }
}
