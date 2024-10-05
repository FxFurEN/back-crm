import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { TasksModule } from './tasks/tasks.module';
import { CategoryTaskService } from './category_task/category_task.service';
import { CategoryTaskController } from './category_task/category_task.controller';
import { CategoryTaskModule } from './category_task/category_task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RedisModule,
    TasksModule,
    CategoryTaskModule,
  ],
  controllers: [UsersController, CategoryTaskController],
  providers: [UsersService, RedisService, CategoryTaskService],
})
export class AppModule {}
