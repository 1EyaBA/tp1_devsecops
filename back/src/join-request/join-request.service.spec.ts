import { Test, TestingModule } from '@nestjs/testing';
import { JoinRequestService } from './join-request.service';

describe('JoinRequestService', () => {
  let service: JoinRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JoinRequestService],
    }).compile();

    service = module.get<JoinRequestService>(JoinRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
