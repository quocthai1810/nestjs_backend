import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  // @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  // @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
  //   message: 'Password must contain at least one special character',
  // })
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  name: string;
}