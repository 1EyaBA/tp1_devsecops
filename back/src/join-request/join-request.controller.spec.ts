import { Test, TestingModule } from '@nestjs/testing';
import { JoinRequestController } from './join-request.controller';
import { JoinRequestService } from './join-request.service';

describe('JoinRequestController', () => {
  let controller: JoinRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JoinRequestController],
      providers: [JoinRequestService],
    }).compile();

    controller = module.get<JoinRequestController>(JoinRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
