import { Test, TestingModule } from '@nestjs/testing';
import { SdssOpticalController } from './sdss-optical.controller';
import { SdssOpticalService } from './sdss-optical.service';

describe('SdssOpticalController', () => {
  let controller: SdssOpticalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SdssOpticalController],
      providers: [SdssOpticalService],
    }).compile();

    controller = module.get<SdssOpticalController>(SdssOpticalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
