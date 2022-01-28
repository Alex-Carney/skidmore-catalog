import { Test, TestingModule } from '@nestjs/testing';
import { SdssDerivedController } from './sdss-derived.controller';
import { SdssDerivedService } from './sdss-derived.service';

describe('SdssDerivedController', () => {
  let controller: SdssDerivedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SdssDerivedController],
      providers: [SdssDerivedService],
    }).compile();

    controller = module.get<SdssDerivedController>(SdssDerivedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
