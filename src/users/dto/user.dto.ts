import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
