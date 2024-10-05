import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CategoryTaskController } from './category_task.controller';
import { CategoryTaskService } from './category_task.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryTaskController],
  providers: [CategoryTaskService],
})
export class CategoryTaskModule {}
