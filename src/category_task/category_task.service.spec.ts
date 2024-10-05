import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTaskService } from './category_task.service';

describe('CategoryTaskService', () => {
  let service: CategoryTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryTaskService],
    }).compile();

    service = module.get<CategoryTaskService>(CategoryTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
