import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumberString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}