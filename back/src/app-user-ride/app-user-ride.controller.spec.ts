import { Test, TestingModule } from '@nestjs/testing';
import { AppUserRideController } from './app-user-ride.controller';
import { AppUserRideService } from './app-user-ride.service';

describe('AppUserRideController', () => {
  let controller: AppUserRideController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUserRideController],
      providers: [AppUserRideService],
    }).compile();

    controller = module.get<AppUserRideController>(AppUserRideController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
