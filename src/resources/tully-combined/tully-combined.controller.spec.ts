import { Test, TestingModule } from '@nestjs/testing';
import { TullyCombinedController } from './tully-combined.controller';
import { TullyCombinedService } from './tully-combined.service';

describe('TullyCombinedController', () => {
  let controller: TullyCombinedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TullyCombinedController],
      providers: [TullyCombinedService],
    }).compile();

    controller = module.get<TullyCombinedController>(TullyCombinedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
