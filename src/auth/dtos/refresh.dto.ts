import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class TokenDto {

  @IsNotEmpty()
  refreshToken: string;

}