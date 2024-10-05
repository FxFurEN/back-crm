import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  name: string;
}
