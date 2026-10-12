import { Test, TestingModule } from '@nestjs/testing';
import { AppUserRideService } from './app-user-ride.service';

describe('AppUserRideService', () => {
  let service: AppUserRideService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppUserRideService],
    }).compile();

    service = module.get<AppUserRideService>(AppUserRideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
