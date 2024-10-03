import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from 'src/database/db-connection';
import * as schema from '../database/schema/schema';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  // Создание задачи
  async createTask(dto: { name: string; categoryId: string; price: number }) {
    const newTask = {
      ...dto,
    };

    await this.database.insert(schema.tasks).values(newTask).execute();

    return newTask;
  }

  // Получение всех задач
  async getTasks() {
    const tasks = await this.database.select().from(schema.tasks).execute();
    return tasks;
  }

  // Получение одной задачи
  async getTaskById(taskId: string) {
    const task = await this.database
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .execute();

    if (!task.length) {
      throw new NotFoundException('Task not found');
    }

    return task[0];
  }

  // Обновление задачи
  async updateTask(taskId: string, dto: { name?: string; price?: number }) {
    const updatedTask = await this.database
      .update(schema.tasks)
      .set(dto)
      .where(eq(schema.tasks.id, taskId))
      .returning()
      .execute();

    if (!updatedTask.length) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask[0];
  }

  // Удаление задачи
  async deleteTask(taskId: string) {
    const task = await this.database
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .returning()
      .execute();

    if (!task.length) {
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }
}
