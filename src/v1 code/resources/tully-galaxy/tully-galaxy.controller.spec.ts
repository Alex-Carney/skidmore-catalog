import { Test, TestingModule } from '@nestjs/testing';
import { TullyGalaxyController } from './tully-galaxy.controller';
import { TullyGalaxyService } from './tully-galaxy.service';

describe('TullyGalaxyController', () => {
  let controller: TullyGalaxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TullyGalaxyController],
      providers: [TullyGalaxyService],
    }).compile();

    controller = module.get<TullyGalaxyController>(TullyGalaxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
