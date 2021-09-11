import { Test, TestingModule } from '@nestjs/testing';
import { TullyEnvironmentController } from './tully-environment.controller';
import { TullyEnvironmentService } from './tully-environment.service';

describe('TullyEnvironmentController', () => {
  let controller: TullyEnvironmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TullyEnvironmentController],
      providers: [TullyEnvironmentService],
    }).compile();

    controller = module.get<TullyEnvironmentController>(TullyEnvironmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
