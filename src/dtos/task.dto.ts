import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task name cannot be empty' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category ID cannot be empty' })
  categoryId: string;

  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;
}
