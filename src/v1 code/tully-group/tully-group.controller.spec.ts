import { Test, TestingModule } from '@nestjs/testing';
import { TullyGroupController } from './tully-group.controller';

describe('TullyGroupController', () => {
  let controller: TullyGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TullyGroupController],
    }).compile();

    controller = module.get<TullyGroupController>(TullyGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
