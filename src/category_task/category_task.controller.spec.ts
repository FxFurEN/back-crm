import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTaskController } from './category_task.controller';

describe('CategoryTaskController', () => {
  let controller: CategoryTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTaskController],
    }).compile();

    controller = module.get<CategoryTaskController>(CategoryTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
